import mousetrap from "mousetrap";
import { useEffect, useRef } from "react";

const useMousetrap = (
  handlerKey: string | string[],
  handlerCallback: (evt: KeyboardEvent, combo: string) => void,
  evtType?: "keypress" | "keydown" | "keyup"
) => {
  const actionRef = useRef(handlerCallback);

  useEffect(() => {
    mousetrap.bind(
      handlerKey,
      (evt: KeyboardEvent, combo: string) => {
        typeof actionRef.current === "function" &&
          actionRef.current(evt, combo);
      },
      evtType
    );
    return () => {
      mousetrap.unbind(handlerKey);
    };
  }, [evtType, handlerKey]);
};

export default useMousetrap;
