const fetch = require('node-fetch')
const send = require('./emailSender.js')
const { cookie } = process.env
const headers = {
  'accept': '*/*',
  'accept-encoding': 'gzip, deflate, br',
  'accept-Language': 'zh-CN,zh;q=0.9',
  'content-type': 'application/json; charset=UTF-8',
  'referer': 'https://juejin.cn/',
  'sec-ch-ua': '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
  'sec-ch-ua-mobile': '?0',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'cross-site',
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_3_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36',
  cookie
}

const request = (url, method='GET', body) => {
  let params = {
    headers,
    method,
    credentials: 'include'
  }
  body && (params.body = body)
  return fetch(url, params).then(response => response.json())
}

const sign = async () => {
  const todayStatus = await request('https://api.juejin.cn/growth_api/v1/get_today_status')
  if (todayStatus.err_no !== 0) return Promise.reject('查询签到失败！')
  if (todayStatus.data) return Promise.resolve('今日已经签到！')

  // 执行签到
  const checkIn = await request('https://api.juejin.cn/growth_api/v1/check_in', 'POST', '{}')
  if (checkIn.err_no !== 0) return Promise.reject('签到失败！')
  return Promise.resolve(checkIn.data)
}

const freeDrew = async () => {
  const lottery = await request('https://api.juejin.cn/growth_api/v1/lottery_config/get')
  if (lottery.err_no !== 0) return Promise.reject('查询抽奖失败！')
  if (lottery.data.free_count === 0) return Promise.resolve('已抽奖')
  const draw = await request('https://api.juejin.cn/growth_api/v1/lottery/draw', 'POST', '{}')
  if (draw.err_no !== 0) return Promise.reject('抽奖失败！')
  return Promise.resolve(draw.data)
}

sign()
.then(res => {
  return freeDrew()
})
.then(res => {
  if (typeof res === 'string') {
    send({text: res})
  } else {
    send({text: `获得： ${res.lottery_name}`})
  }
}, reason => {
  // 处理错误
  send({text: reason})
})