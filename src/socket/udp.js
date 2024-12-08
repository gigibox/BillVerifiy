'use strict'

import dgram from "dgram"
// import ping from "net-ping"

import { ipcMain } from "electron"
import { instructions, decodeBroadcast, decodeStatus, decodeDate, decodeConfig } from "./clock"

// 获取本机Ip
// ipcMain.on("ping", (event, arg) => {
//   const session = ping.createSession();

//   session.pingHost(arg, (error, target) => {
//     if (error) {
//       event.sender.send("ping-replay", JSON.stringify({ ip: arg, success: "false" }))
//     } else {
//       event.sender.send("iplist", JSON.stringify({ ip: arg, success: true }))
//     }
//   })

// })

// 获取本机Ip
ipcMain.on("get-iplist", (event, arg) => {
  const os = require('os')
  var interfaces = os.networkInterfaces();
  event.sender.send("iplist", JSON.stringify(interfaces))
})

// 广播发现设备
ipcMain.on("discover", (event, hostip) => {
  const socket = dgram.createSocket("udp4");
  socket.bind({ address: hostip }, function () {
    socket.setBroadcast(true);
  });

  socket.on('message', (msg, rinfo) => {
    // console.log(`服务器收到：${msg} 来自 ${rinfo.address}:${rinfo.port}`);

    let devInfo = decodeBroadcast(msg)
    if (devInfo != null) {
      console.log(devInfo)
      devInfo.address = rinfo.address
      event.sender.send("discover-reply", JSON.stringify(devInfo))
      getClockNetConfig(event, hostip, devInfo.mac, -1)
    }
  });

  let message = Buffer.from(instructions.discovry)

  socket.send(message, 0, message.length, 30001, '255.255.255.255');

  setTimeout(() => {
    socket.close();
    event.sender.send("discover-over")
  }, 5000)
})

// 关闭设备
ipcMain.on("close-device", (event, arg) => {
  const socket = dgram.createSocket("udp4");

  let message = Buffer.from(instructions.close)
  let port = arg.port ? arg.port : "40001"
  if (arg.clients) {
    arg.clients.forEach(addr => {
      socket.send(message, 0, message.length, port, addr, function (err, len) {
        if (err == null) {
          event.sender.send("close-reply", "success")
        }
      });
    })
  }

  setTimeout(() => {
    socket.close();
  }, 15000)
})

// 唤醒设备
ipcMain.on("wake-device", (event, arg) => {
  const socket = dgram.createSocket("udp4");

  let message = Buffer.from(instructions.wake)

  let port = arg.port ? arg.port : "40001"
  if (arg.clients) {
    arg.clients.forEach(addr => {
      socket.send(message, 0, message.length, port, addr, function (err, len) {
        // event.sender.send("close-reply", "success")
        // socket.close();
      });
    })
  }

  setTimeout(() => {
    socket.close();
  }, 15000)
})

// 查看设备开关状态
ipcMain.on("status", (event, arg) => {
  const socket = dgram.createSocket("udp4");
  let message = Buffer.from(instructions.status)

  socket.on('message', (msg, rinfo) => {
    console.log("Recevie status msg", msg, "from", rinfo.address, rinfo.port)
    if (msg.length != 7) {
      console.log("unrecognized message")
      return
    }
    let devInfo = decodeStatus(msg)
    if (devInfo != null) {
      devInfo.address = rinfo.address
      console.log("reply msg", devInfo)
      event.sender.send("status-reply", JSON.stringify(devInfo))
    }
  });

  let port = arg.port ? arg.port : "40001"
  if (arg.clients) {
    arg.clients.forEach(addr => {
      socket.send(message, 0, message.length, port, addr, function (err, len) {
        // console.log(addr, err, len)
      });
    })
  }

  setTimeout(() => {
    socket.close();
  }, 15000)
})

// 读取当前设备时间
ipcMain.on("read-date", (event, arg) => {
  const socket = dgram.createSocket("udp4");
  let message = Buffer.from(instructions.readDate)

  socket.on('message', (msg, rinfo) => {
    console.log("Recevie date msg", msg, "from", rinfo.address, rinfo.port)
    if (msg.length != 14) {
      console.log("unrecognized message")
      return
    }
    let devInfo = decodeDate(msg)
    if (devInfo != null) {
      devInfo.address = rinfo.address
      console.log("reply msg", devInfo)
      event.sender.send("date-reply", JSON.stringify(devInfo))
    }
  });

  let port = arg.port ? arg.port : "40001"
  if (arg.clients) {
    arg.clients.forEach(addr => {
      socket.send(message, 0, message.length, port, addr, function (err, len) {
        // console.log(addr, err, len)
      });
    })
  }

  setTimeout(() => {
    socket.close();
  }, 15000)
})

// 设置时间 3A 01 74 08 14 11 08 17 03 09 2A 00 F7 0A 
ipcMain.on("set-time", (event, req) => {
  const socket = dgram.createSocket("udp4");

  // 数据格式     起始码   地址码  功能码  数据长度  年 年   月  日  周  时  分   秒 检验和 结束码
  let msgCode = ['0x3A', '0x01', '0x74', '0x08']
  let endCode = '0x0A'

  // console.log(req)
  req.arg.split(':').forEach(val => {
    msgCode.push('0x' + parseInt(val).toString(16))
  })

  let checkSum = 0
  for (let i = 1; i < msgCode.length; i++) {
    checkSum = checkSum + parseInt(msgCode[i], 16)
  }
  msgCode[12] = '0x' + checkSum.toString(16)
  msgCode.push(endCode)
  // console.log(msgCode)

  let megByte = Buffer.from(msgCode)

  let port = req.port ? req.port : "40001"
  if (req.clients) {
    req.clients.forEach(addr => {
      socket.send(megByte, 0, megByte.length, port, addr, function (err, len) {
        // event.sender.send("close-reply", "success")
        // socket.close();
      });
    })
  }

  setTimeout(() => {
    socket.close();
  }, 15000)
})

// 设置时间时间段 3A 01 77 10 01 08 00 09 00 01 0a 10 0b 00 01 0c 00 0d 00 01 Db  0A 
ipcMain.on("set-time-segment", (event, req) => {
  const socket = dgram.createSocket("udp4");

  // 数据格式     起始码   地址码  功能码  数据长度
  let msgCode = ['0x3A', '0x01', '0x77', '0x10']
  let endCode = '0x0A'

  // console.log(req)
  req.arg.split(':').forEach(val => {
    msgCode.push('0x' + parseInt(val).toString(16))
  })

  // 计算校验和
  let checkSum = 0
  for (let i = 1; i < msgCode.length; i++) {
    checkSum = checkSum + parseInt(msgCode[i], 16)
  }

  // 添加校验和
  msgCode.push('0x' + checkSum.toString(16))

  // 添加结束码
  msgCode.push(endCode)
  // console.log(msgCode)

  let megByte = Buffer.from(msgCode)

  let port = req.port ? req.port : "40001"
  if (req.clients) {
    req.clients.forEach(addr => {
      socket.send(megByte, 0, megByte.length, port, addr, function (err, len) {
        // event.sender.send("close-reply", "success")
        // socket.close();
      });
    })
  }

  setTimeout(() => {
    socket.close();
  }, 15000)
})

// 设置时间时间段 3A 01 77 10 01 08 00 09 00 01 0a 10 0b 00 01 0c 00 0d 00 01 Db  0A 
ipcMain.on("config-client", (event, arg) => {
  let req = JSON.parse(arg)
  let clients = req.clients

  const socket = dgram.createSocket("udp4");
  socket.bind({ address: req.hostIp }, function () {
    socket.setBroadcast(true);
  });

  socket.on('message', (msg, rinfo) => {
    // console.log("config-client服务器收到", msg, "来自", rinfo.address, rinfo.port);
    if (clients.indexOf(rinfo.address) < 0) {
      console.log("不存在")
      return
    }

    let devInfo = decodeBroadcast(msg)
    if (devInfo != null) {
      // console.log("请求电子钟配置状态", req.hostIp, devInfo.mac, req.model)
      getClockNetConfig(event, req.hostIp, devInfo.mac, req.model)
    }
  });

  let message = Buffer.from(instructions.discovry)

  socket.send(message, 0, message.length, 30001, '255.255.255.255');

  setTimeout(() => {
    socket.close();
    // event.sender.send("discover-over")
  }, 5000)

})

function getClockNetConfig(event, hostip, mac, model) {
  if (mac.length < 10) {
    return
  }

  // 数据格式     起始码   地址码  功能码  数据长度
  let msgCode = ['0x3A', '0xFF', '0xFF', '0xFF', '0xFF', '0x05', '0x45', '0x00', '0x07', '0x02']

  // 追加mac
  for (let i = 0, j = 2; i <= 10; i += 2, j += 2) {
    msgCode.push('0x' + mac.substring(i, j))
  }

  // 计算校验和
  let checkSum = 0
  for (let i = 0; i < msgCode.length; i++) {
    checkSum = checkSum + parseInt(msgCode[i], 16)
  }

  // 添加校验和
  let checkSumStr = checkSum.toString(16)
  msgCode.push('0x' + checkSumStr.substring(checkSumStr.length - 2))


  let megByte = Buffer.from(msgCode)

  const socket = dgram.createSocket("udp4");
  socket.bind({ address: hostip }, function () {
    socket.setBroadcast(true);
  });

  socket.on('message', (msg, rinfo) => {
    // console.log("config-clock服务器收到", msg.toString('hex'), "来自", rinfo.address, rinfo.port);

    let devInfo = decodeConfig(msg)
    if (devInfo != null) {
      console.log(devInfo)
      devInfo.address = rinfo.address
      event.sender.send("config-reply", JSON.stringify(devInfo))
    }

    // 仅查询
    if (model === -1) {
      return
    }
    setClockNetConfig(hostip, msg, model)
  });

  console.log("发送:", megByte)
  socket.send(megByte, 0, megByte.length, 30001, '255.255.255.255');

  setTimeout(() => {
    socket.close();
    // event.sender.send("discover-over")
  }, 5000)
}

function setClockNetConfig(hostip, msg, model) {
  let devConfig = []
  for (let i = 10; i < msg.length - 1; i++) {
    devConfig.push('0x' + msg[i].toString(16))
  }

  // 设置udpclient
  devConfig[8] = model ? "0x01" : "0x00"

  let mac = devConfig.slice(0, 6)
  // console.log(mac)
  // 数据格式     起始码   地址码  功能码  数据长度
  let msgCode = ['0x3A', '0xFF', '0xFF', '0xFF', '0xFF', '0x05', '0x65', '0x00', '0xBF', '0x01']
  msgCode = msgCode.concat(devConfig).concat(mac)

  // 计算校验和
  let checkSum = 0
  for (let i = 0; i < msgCode.length; i++) {
    checkSum = checkSum + parseInt(msgCode[i], 16)
  }

  // 添加校验和
  let checkSumStr = checkSum.toString(16)
  msgCode.push('0x' + checkSumStr.substring(checkSumStr.length - 2))
  // console.dir(msgCode, { 'maxArrayLength': null })

  let megByte = Buffer.from(msgCode)

  const socket = dgram.createSocket("udp4");
  socket.bind({ address: hostip }, function () {
    socket.setBroadcast(true);
  });

  socket.on('message', (msg, rinfo) => {
    console.log("set-config-clock服务器收到", msg, "来自", rinfo.address, rinfo.port);
    // setClockNetConfig(msg, model)
  });

  console.log("发送:", megByte)
  socket.send(megByte, 0, megByte.length, 30001, '255.255.255.255');

  setTimeout(() => {
    socket.close();
    // event.sender.send("discover-over")
  }, 5000)
}