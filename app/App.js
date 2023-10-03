import Button from './Button.js';
import Card from './Card.js';
import { useEffect, useState, useMemo } from '../src/hooks';
const App = () => {
  const count = useState(1);

  const arr = useState([]);
  const callback = () => {
    count.setValue(count.value + 1);
    arr.setValue([...arr.value, arr.value.length + 1]);
  };
  const doubleCount = useMemo(() => count.value * 2, [count]);

  useEffect(() => {
    console.log('useffect called', doubleCount.value);
  }, [doubleCount]);

  return (
    <Card>
      {arr.value.map((item) => <div key={item}>{item}</div>)}
      <Button onClick={callback}>add item</Button>
      {/* <Button onClick={callback}>Click Count</Button> */}
      {/* <Button onClick={() => count.setValue(0)}>Reset {doubleCount}</Button> */}
      {/* <Button onClick={() => count2.setValue(count2.value + 1)}> */}
      {/*   count 2 {count2} */}
      {/* </Button> */}
      {/* {count.value >= 1 ? ( */}
      {/*   count.value >= 3 ? ( */}
      {/*     <Card>greater than 3</Card> */}
      {/*   ) : */}
      {/*     <Card>Not greater than 3</Card> */}
      {/* ) */}
      {/*   : ( */}
      {/*     <Card>less than 1</Card> */}
      {/*   )} */}

      {doubleCount.value >= 1 ? <Card>greater than 1</Card> : <Card>less than 1</Card>}
      {/* {count.value >= 1 && <Card>greater than 0</Card>} */}
      {/* {(count.value >= 3 || count.value === 1) && <Card>greater than 0</Card>} */}
      {/* {(count.value >= 1 || count.value > 2) && (count.value >= 3 ? <Card>greater than 3</Card> : <Card>less than 3</Card>)} */}
      {/* {count.value >= 1 && (count.value >= 3 ? <Card>greater than 3</Card> : <Card>less than 3</Card>)} */}
      {/* {count.value >= 1 && count.value >= 3 ? <Card>greater than 3</Card> : <Card>less than 3</Card>} */}
      {/* {count.value >= 1 && <Card>greater than 0</Card>} */}
      {/* {count.value >= 1 && (count.value >= 3 ? <Card>greater than 3</Card> : <Card>less than 3</Card>)} */}

    </Card>
  );
};

export default App;
