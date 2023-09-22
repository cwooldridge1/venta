import Button from './Button.js';
import Card from './Card.js';
import { useEffect, useState, useMemo } from '../src/hooks';
const App = () => {
  const count = useState(0);
  const count2 = useState(0);
  const callback = () => {
    count.setValue(count.value + 1);
  };
  const doubleCount = useMemo(() => count.value * 2, [count]);

  useEffect(() => {
    console.log('useffect called', doubleCount.value);
  }, [doubleCount]);

  return (
    <Card>
      <Button onClick={callback}>Click Count {count}</Button>
      <Button onClick={() => count.setValue(0)}>Reset</Button>
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

      {/* {count.value >= 1 ? <Card>greater than 1</Card> : <Card>less than 1</Card>} */}
      {/* {count.value >= 1 && <Card>greater than 0</Card>} */}
      {/* {(count.value >= 3 || count.value === 1) && <Card>greater than 0</Card>} */}
      {/* {(count.value >= 1 || count.value > 2) && (count.value >= 3 ? <Card>greater than 3</Card> : <Card>less than 3</Card>)} */}
      {/* {count.value >= 1 && (count.value >= 3 ? <Card>greater than 3</Card> : <Card>less than 3</Card>)} */}
      {/* {count.value >= 1 && count.value >= 3 ? <Card>greater than 3</Card> : <Card>less than 3</Card>} */}
      {doubleCount.value >= 2 && <span>gt2</span>}
    </Card>
  );
};

export default App;
