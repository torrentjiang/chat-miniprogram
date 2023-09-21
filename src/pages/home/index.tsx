import {useEffect, useState} from "react";
import { Input, RichText } from "@tarojs/components";
import { useLoad } from "@tarojs/taro";
import { TTSRecorder } from "./websock";
import "./index.less";

interface ChatBoxType {
  role: "assistant" | "user";
  content: string;
  id?: string;
}

const ChatBox = (props: ChatBoxType) => {
  const { role, content } = props;
  if (role === "assistant") {
    return (
      <li className="flex justify-start" style={{overflowX: "scroll"}}>
        <div className="w-full relative px-4 py-2 text-gray-700 bg-sky-100 rounded shadow" style={{overflowX: "scroll"}}>
          {/* <span className="block">{content}</span > */}
          <wemark className="overflow-scroll" style={{overflowX: "scroll"}} md={content} link highlight type='wemark' />
        </div>
      </li>
    );
  } else {
    return (
      <li className="flex justify-end">
        <div className="w-3/4 relative px-4 py-2 text-gray-700 bg-gray-100 rounded shadow">
          {/* <span  className="block">{content}</span > */}
          <wemark className="max-w-xl" md={content} link highlight type='wemark' />
        </div>
      </li>
    );
  }
};

const Chat = ({payloadList}: {payloadList: any}) => {
  
  const [inputMessage, setinputMessage] = useState<string>('');
  const [messagesList, setmessagesList] = useState<any[]>(payloadList);
  let lastInput: string = "";
  let responseText: string = "";

  const inputQuery = (res) => {
    setinputMessage(res.detail.value)
  }

  const callback = (callbackdata: any) => {
    console.log('callbackdata-MSG:', callbackdata)
    const {payload = {}, } = callbackdata;
    const {choices} = payload;
    if (payload?.usage) {
      setinputMessage("")
    }
      // return finish();
    console.log('responseText:', responseText)

    // }
    const obj = choices;
    try {
      const delta = obj.text?.[0]?.content || "";
      if (delta) {
        responseText += delta;
      }
    } catch (e) {
      console.error("[Request] parse error", e);
    }
    setmessagesList([
      ...messagesList,
      {
        role: 'user',
        content: lastInput,
      },
      {
        role: 'assistant',
        content: responseText,
      }
    ]
    )
  };

  const sendMsg = () => {
    if (!inputMessage) return
    const tempPayload = {
      messages: [...payloadList, {
        role: 'user',
        content: inputMessage
      }]
    }
    lastInput = inputMessage
    // setmessagesList(tempPayload.messages)
    let bigModel = new TTSRecorder('5354ab8d', tempPayload.messages, callback);
    bigModel.start();
  };

  useEffect(() => {
    console.log('messagesList',messagesList )
  }, [messagesList])

  return (
    <div className="container">
      <div className="max-w-xl border rounded">
        <div className="w-full h-full flex flex-col">
          <div className="relative flex items-center p-3 border-b border-gray-300">
            <img
              className="object-cover w-10 h-10 rounded-full"
              src="https://torrentjiang.store/cdn/allogo.jpg"
              alt="username"
            />
            <span className="block ml-2 font-bold text-gray-600">AI-小小</span>
            <span className="absolute w-3 h-3 bg-green-600 rounded-full left-10 top-3"></span>
          </div>
          <div className="relative flex p-6 mb-12 flex-grow">
            <ul className="space-y-2 w-full">
              {
                !!messagesList?.length && messagesList.map((e: ChatBoxType) => (
                  <ChatBox key={e?.id} role={e.role} content={e.content} />
                ))
              }
            </ul>
          </div>
          <div className="fixed flex items-center justify-between w-full p-3 bottom-0 border-t border-gray-300 bg-gray-100">
            {/* <button className="bg-transparent"> */}
            <span>
              <img 
                className="w-5 h-5"
                src="https://torrentjiang.store/cdn/shanchu.svg" 
                style={{maxWidth: "none"}} 
                alt="shanchu SVG" 
              />
            </span>
            {/* </button> */}

            <Input
              value={inputMessage}
              type="text"
              placeholder="Message"
              className="bg-transparent block w-1/2 py-2 pl-4 mx-3 bg-gray-100 rounded-full outline-none focus:text-gray-700"
              name="message"
              onInput={inputQuery}
            />
            <span onClick={()=> setinputMessage("")}>
              <img className="w-5 h-5" src="https://torrentjiang.store/cdn/qingchudiangongju.svg" style={{maxWidth: "none"}} alt="qingchudiangongju SVG" />
            </span>
            {/* <button className="bg-transparent">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 mr-1 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </button> */}
            {/* <button className="bg-transparent" type="submit" onClick={sendMsg}> */}
            <span onClick={sendMsg}>
              <img className="w-5 h-5 mr-10" src="https://torrentjiang.store/cdn/fasong.svg" style={{maxWidth: "none"}} alt="fasong SVG" />
            </span>
            {/* </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Index() {

  const [requestPayload, setRequestPayload] = useState([
    {
      role: "assistant",
      content: "你好，有什么可以帮你的吗",
    }]
  );

  useLoad(() => {
    console.log("Page loaded.");
  });

  return (
    <Chat payloadList={requestPayload}/>
  );
}
