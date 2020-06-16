import React, { useState } from 'react';
import { connect } from 'react-redux';
import {
  decrement,
  increment,
  incrementByAmount,
  incrementAsync,
  selectCount,
} from './counterSlice';

export function CounterInner({
  count,
  increment,
  decrement,
  incrementByAmount,
  incrementAsync,
}) {
  const [incrementAmount, setIncrementAmount] = useState("2");

  return (
    <div>
      <div>
        <button
          aria-label="Increment value"
          onClick={() => increment()}
        >
          +
        </button>
        <span>{count}</span>
        <button
          aria-label="Decrement value"
          onClick={() => decrement()}
        >
          -
        </button>
      </div>
      <div>
        <input
          aria-label="Set increment amount"
          value={incrementAmount}
          onChange={e => setIncrementAmount(e.target.value)}
        />
        <button
          onClick={() =>
            incrementByAmount(Number(incrementAmount) || 0)
          }
        >
          Add Amount
        </button>
        <button
          onClick={() => incrementAsync(Number(incrementAmount) || 0)}
        >
          Add Async
        </button>
      </div>
    </div>
  );
}

const mapStateToProps = (state: any) => {
  return {
    count: selectCount(state),
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    increment: () => dispatch(increment()),
    decrement: () => dispatch(decrement()),
    incrementByAmount: (amount: number) => dispatch(incrementByAmount(amount)),
    incrementAsync: (amount: number) => dispatch(incrementAsync(amount)),
  };
};

export const Counter = connect(
    mapStateToProps,
    mapDispatchToProps
)(CounterInner);
