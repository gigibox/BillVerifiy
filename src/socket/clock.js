export const instructions = {
  "discovry": ["0x3a", "0xff", "0xff", "0xff", "0xff", "0x05", "0x45", "0x00", "0x07", "0x01", "0xff", "0xff", "0xff", "0xff", "0xff", "0xff", "0x82"],
  "close": ["0x3a", "0x01", "0x63", "0x01", "0x00", "0x66", "0x0a"],
  "wake": ["0x3a", "0x01", "0x63", "0x01", "0x01", "0x66", "0x0a"],
  "status": ["0x3A", "0x01", "0x43", "0x44", "0x0A"],
  "readDate": ["0x3A", "0x01", "0x54", "0x55", "0x0A"]
}

// 2a ff ff ff ff 05 45 00 1f 01 d8 27 39 08 98 48 53 50 2d 4e 45 54 2d 55 41 52 54 00 00 00 00 00 56 65 72 31 2e 38 00 00 94
export const decodeBroadcast = msg => {
  if (msg.length < 1) {
    return null
  }

  let modelIndexStart = 16
  let modelIndexEnd = msg.indexOf(0x00, 16)
  if (modelIndexEnd == -1) {
    modelIndexEnd = 31
  }

  let verIndexStart = 32
  let verIndexEnd = msg.indexOf(0x00, 32)
  if (verIndexEnd == -1) {
    verIndexEnd = 39
  }

  let devInfo = {
    mac: msg.toString('HEX', 10, 16).toUpperCase(),
    model: msg.toString('utf8', modelIndexStart, modelIndexEnd),
    version: msg.toString('utf8', verIndexStart, verIndexEnd)
  }

  return devInfo
}

export const decodeStatus = msg => {
  if (msg.length < 1) {
    return null
  }

  // console.log(msg, msg.length, msg[4])

  return {
    status: msg[4]
  }
}

const weekDic = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']
function parseWeek(day) {
  if (day > 0 && day < 8) {
    return weekDic[day - 1]
  }

  return ""
}

function prefixZero(num) {
  return (Array(2).join(0) + num).slice(-2).toString();
}

export const decodeDate = msg => {
  if (msg.length < 1) {
    return null
  }

  let dateStr = prefixZero(msg[4]) + prefixZero(msg[5]) + "-" + prefixZero(msg[6]) + "-" + prefixZero(msg[7]) + " " +
    prefixZero(msg[9]) + ":" + prefixZero(msg[10]) + ":" + prefixZero(msg[11]) + " " + parseWeek(msg[8])

  return {
    date: dateStr
  }
}

export const decodeConfig = msg => {
  let devInfo = {
    netModel: msg[17],
    clientModel: msg[18],
  }

  return devInfo
}