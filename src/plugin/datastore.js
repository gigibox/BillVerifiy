
import Datastore from 'nedb'
const { remote } = window.require('electron')

const basePath = remote.app.getPath('userData')
console.log('程序数据存储路径：', basePath)

let db = {};
db.persons = new Datastore({
  autoload: true,
  filename: basePath + '/db/person.db'
})

db.payment = new Datastore({
  autoload: true,
  filename: basePath + '/db/payment.db'
})

db.canceled = new Datastore({
  autoload: true,
  filename: basePath + '/db/canceled.db'
})

export default db