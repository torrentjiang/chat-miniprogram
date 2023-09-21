import CryptoJS from 'crypto-js';
import {weBtoa} from '../../../utils/weapp-jwt';
import Taro from '@tarojs/taro';

const APPID = '5354ab8d'
const API_SECRET = 'OTY0NTMxNTQzOGZlNDllOWE5NDMwMWRj'
const API_KEY = '2236e08b1c10dd1fee26914491a29c83'

function getWebsocketUrl(): any {
    return new Promise((resolve, reject) => {
        var apiKey = API_KEY
        var apiSecret = API_SECRET
        var url = 'wss://spark-api.xf-yun.com/v2.1/chat'
        var host = location.host
        //@ts-ignore
        var date = new Date().toGMTString()
        var algorithm = 'hmac-sha256'
        var headers = 'host date request-line'
        var signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2.1/chat HTTP/1.1`
        var signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret)
        var signature = CryptoJS.enc.Base64.stringify(signatureSha)
        var authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`
        var authorization = weBtoa(authorizationOrigin)
        url = `${url}?authorization=${authorization}&date=${encodeURI(date)}&host=${host}`
        resolve(url)
    })
}

export class TTSRecorder {
    appId: string
    status: 'init' | 'ttsing'  | 'error'
    sendMSg: Object
    callMsgFnc: Function
    onWillStatusChange?: Function
    ttsWS?: WebSocket
    constructor(
            appId = APPID,
            sendMSg = {},
            callMsgFnc = (e:any) => {},
        ) {
        this.appId = appId;
        this.sendMSg = sendMSg;
        this.callMsgFnc = callMsgFnc
        this.status = 'init'
    }

    // 修改状态
    setStatus(status: 'init' | 'ttsing'  | 'error') {
        this.onWillStatusChange && this.onWillStatusChange(this.status, status)
        this.status = status
    }

    // 连接websocket
    connectWebSocket() {
        this.setStatus('ttsing')
        return getWebsocketUrl().then( (url: string) => {
            let ttsWS;
            ttsWS = Taro.connectSocket({url: url, success: function () {
                console.log('connect success')
            }})
            // if ('WebSocket' in window) {
            // } else {
            //     console.log('浏览器不支持WebSocket')
            //     return
            // }
            Taro.onSocketOpen(()=> {
                console.log('连接打开了:', this)
                var params = {
                    "header": {
                        "app_id": '5354ab8d',
                        "uid": "fd3f47e4-d"
                    },
                    "parameter": {
                        "chat": {
                            "domain": "generalv2",
                            "temperature": 0.5,
                            "max_tokens": 1024
                        }
                    },
                    "payload": {
                        "message": {
                            "text": this.sendMSg
                        }
                    }
                }
                Taro.sendSocketMessage({
                    data: JSON.stringify(params)
                })
            })
            Taro.onSocketMessage((res) => {
                console.log('收到服务器内容：' + res.data)
                res.data && this.callMsgFnc(JSON.parse(res.data))
            })
            Taro.onSocketError((res) => {
                console.log('WebSocket连接打开失败，请检查！', res)
            })
            Taro.onSocketClose(() => {
                console.log('WebSocket 已关闭！')
            })
            this.ttsWS = ttsWS
            ttsWS.onOpen = e => {
                this.webSocketSend(this.sendMSg)
            }
            ttsWS.onMessage = e => {
                e.data && this.callMsgFnc(JSON.parse(e.data))
            }
            ttsWS.onError = e => {
                this.setStatus('error')
                console.log('WebSocket报错，请f12查看详情')
                console.error(`详情查看：${encodeURI(url.replace('wss:', 'https:'))}`)
            }
            ttsWS.onClose = e => {
                console.log('close', e)
            }
        })
    }
    start() {
        this.connectWebSocket()
    }
    webSocketSend(sendMSg: Object) {
        console.log('sendMSg', sendMSg)
        var params = {
            "header": {
                "app_id": this.appId,
                "uid": "fd3f47e4-d"
            },
            "parameter": {
                "chat": {
                    "domain": "generalv2",
                    "temperature": 0.5,
                    "max_tokens": 1024
                }
            },
            "payload": {
                "message": {
                    "text": sendMSg
                }
            }
        }
        console.log(JSON.stringify(params))
        //@ts-ignore
        this.ttsWS && this.ttsWS.sendSocketMessage(JSON.stringify(params))
    }
    result(resultData: any) {
        let jsonData = JSON.parse(resultData)
        console.log('jsonData:', jsonData)
    }
}