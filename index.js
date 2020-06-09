const { Wechaty, UrlLink } = require('wechaty')
const { ScanStatus } = require('wechaty-puppet')
const { PuppetPadplus } = require('wechaty-puppet-padplus')
const QrcodeTerminal  = require('qrcode-terminal')

const APPID = 'wx48f51627bef8bcdf'
const REDIRECT_URI = 'https://wallet.prabox.net'
const thumbnailUrl = 'https://static.chain.pro/chain/praad.gif'
const token = 'puppet_padplus_f33061d810ccff34'
const puppet = new PuppetPadplus({
  token,
})

const name  = 'robot1'
const lastSpeakTime = {}
const bot = new Wechaty({
  puppet,
  name,
})

bot
  .on('scan', (qrcode, status) => {
    if (status === ScanStatus.Waiting) {
      console.log(qrcode, 'qrcode')
      QrcodeTerminal.generate(qrcode, {
        small: true
      })
    }
  })
  .on('login', (user) => {
    console.log(`login success, user: ${user}`)
  })
  .on('message', async (msg) => {
    const text = msg.text().trim()
    const room = msg.room()
    console.log(`msg : ${msg}`)
    try {
      if (room) {
        if (text === '钱包') {
          const redirectUri = encodeURIComponent(`${REDIRECT_URI}/#/`)
          const url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${APPID}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect`
    
          const linkPayload = new UrlLink({
            description: '快速转账、收款、抵押',
            thumbnailUrl,
            title: '点击进入钱包（请收藏）',
            url
          })
          console.log(`${room.id}wallet`, 'room key')
          if (checkTime(`${room.id}wallet`)) await room.say(linkPayload)
        }
      
        if (text === '抽奖') {
          const redirectUri = encodeURIComponent(`${REDIRECT_URI}/#/activity/lucky-wheel`)
          const url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${APPID}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect`
          const title = '点击进入抽奖'
          const description = 'PRM大奖等你拿'
          const linkPayload = new UrlLink({
            description,
            thumbnailUrl,
            title,
            url
          })
          if (checkTime(`${room.id}lottery`)) await room.say(linkPayload)
        }
      }
    } catch (error) {
      console.log(error)
    }
  })
  .on('logout', (user, reason) => {
    console.log(`logout user: ${user}, reason : ${reason}`)
  })
  .start()
  .catch(console.error)

function checkTime(key) {
  const timestamp = lastSpeakTime[key]
	if (timestamp) {
		const timeElapsed = Date.now() / 1000 - timestamp
		console.log(timeElapsed, '发送消息时间间隔')
		if (timeElapsed < 30) {
      return false
    }
    lastSpeakTime[key] = Date.now() / 1000
    return true
	}
  lastSpeakTime[key] = Date.now() / 1000
  return true
}
