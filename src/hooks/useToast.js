import { useCallback, useState } from "react";

export function useToast() {
  const [msg, setMsg] = useState(null);
  const show = useCallback((m) => {
    setMsg(m);
    window.setTimeout(() => setMsg(null), 1800);
  }, []);
  return { msg, show };
}
