# react-native-wisebacksdk-module

WisebackSDK for ReactNative

## Installation

```sh
npm install react-native-wisebacksdk-module
```

## Usage

```js
import WiseView from 'react-native-wisebacksdk-module';

// ...

type WiseParamType = {
  eventName: string;
  params?: Record<string, string>;
  resultData?: Boolean
};

function App(): JSX.Element {
  const [appID] = useState("ENTER APP ID");
  const [hostname] = useState("ENTER HOST NAME");
  const [formID, setFormID] = useState("");
  const [eventParams, setEventParams] = useState<WiseParamType | null>(null);

  const showForm = (pFormID:string) => {
    setFormID(pFormID);
  }
  const clearFormID = () => {
    setFormID("");
  }
  const eventListener = (eventName: string, eventData?: any) => {
    console.log("event triggered: ", eventName, "data: ", eventData);
  }
  const callEvent = (pEventParams:WiseParamType) => {
    setEventParams(pEventParams);
  }

  return (
    <SafeAreaView style={{flex:1}}>
      <WiseView appID={appID} hostname={hostname} formID={formID} eventParams={eventParams} showLoader={true} closeButton={false} closeHandler={clearFormID} eventHandler={eventListener} />
      <Button title="Show Form" onPress={()=>showForm("ENTER FORM ID")} />
      <Button title="Call Event" onPress={()=>callEvent({eventName: "ENTER EVENT NAME", params: {ENTER CUSTOM PARAMETERS}, resultData: false})} />
    </SafeAreaView>
  );
  
}
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---