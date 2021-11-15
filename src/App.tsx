import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import { bindProxyAndYArray } from "valtio-yjs";
import { proxy, useSnapshot } from "valtio";
import { useState } from "react";
import { nanoid } from "nanoid/non-secure";

type SharedMessage = { id: string; text: string; vote: number }

const ydoc = new Y.Doc();

const provider = new IndexeddbPersistence('messages-v2', ydoc)

provider.on('synced', () => {
  console.log('content from the database is loaded')
})

const yarray = ydoc.getArray("messages.v2");
const messages = proxy([] as SharedMessage[]);
bindProxyAndYArray(messages, yarray);

const MyMessage = () => {
  const [message, setMessage] = useState("");
  const send = () => {
    if (message) {
      messages.unshift({ id: nanoid(), text: message, vote: 1 });
      setMessage("");
    }
  };
  return (
    <div>
      Message:{" "}
      <input value={message} onChange={(e) => setMessage(e.target.value)} />{" "}
      <button disabled={!message} onClick={send}>
        Send
      </button>
    </div>
  );
};

type MessageProps = { message: SharedMessage } 

const Message = ({ message }: MessageProps) => {
  const voteUp = () => {
    const found = messages.find((item) => item.id === message.id);
    if (found) {
      found.vote++
    }
  };
  return (
    <p>
      [{message.vote}]
      <button onClick={voteUp}>
        +1
      </button>
      : {message.text}
    </p>
  );
};

const Messages = () => {
  const snap = useSnapshot(messages);
  return (
    <div>
      {snap.map((message) => (
        <Message key={message.id} message={message} />
      ))}
    </div>
  );
};

const App = () => (
  <div>
    <h2>My Message</h2>
    <MyMessage />
    <h2>Messages</h2>
    <Messages />
  </div>
);

export default App;
