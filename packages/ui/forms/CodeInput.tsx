import { AnimatePresence, motion } from "framer-motion";
import { useId, useRef, useState } from "react";
import Spinner from "../interactions/Spinner";

export default function CodeInput({
  disabled,
  onComplete,
  error,
  length = 6,
  loading = false,
  label,
}: {
  disabled?: boolean;
  onComplete: (code: string, setCode?: () => void) => void;
  error?: null | string;
  length?: number;
  loading?: boolean;
  label?: string;
}) {
  const id = useId();
  const [code, setCode] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1 && value.length == code.length) {
      // Handle pasting of the code
      const newCode = [...code];
      const pasteValues = value.split("");
      pasteValues.forEach((pasteValue, pasteIndex) => {
        if (index + pasteIndex < code.length) {
          newCode[index + pasteIndex] = pasteValue;
        }
      });
      setCode(newCode);
      inputRefs.current[index + pasteValues.length - 1]?.focus();
      onComplete(newCode.join(""), () => {
        setCode(Array(length).fill(""));
        inputRefs.current[0]?.focus();
      });
    } else {
      // Handle typing of a single character
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      if (value && index < inputRefs.current.length - 1) {
        inputRefs.current[index + 1]?.focus();
        return;
      }
      onComplete(newCode.join(""), () => {
        setCode(Array(length).fill(""));
        inputRefs.current[0]?.focus();
      });
    }
  };

  const handleInputKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      const newCode = [...code];
      newCode[index - 1] = "";
      setCode(newCode);
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="bg-white px-1 text-sm pb-1.5 block font-medium text-gray-500"
        >
          {label}
        </label>
      )}
      <div className="flex items-center gap-2 w-full">
        {code.map((value, index) => (
          <div key={index} className="w-full flex items-center gap-2 relative">
            <AnimatePresence>
              {loading && (
                <motion.div
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0 }}
                  className="absolute top-0 left-0 w-full h-full bg-gray-50 border-gray-200 border rounded-lg text-gray-600 flex items-center justify-center"
                >
                  <Spinner />
                </motion.div>
              )}
            </AnimatePresence>
            <input
              value={value}
              placeholder={`${index + 1}`}
              disabled={disabled}
              id={index == 0 ? id : undefined}
              autoFocus={index == 0}
              onChange={(event) => handleInputChange(index, event.target.value)}
              onKeyDown={(event) => handleInputKeyDown(index, event)}
              ref={(input) => (inputRefs.current[index] = input)}
              aria-label={`Code input ${index + 1}`}
              aria-invalid={value.length !== 1}
              className={`block w-full text-center py-2.5 text-gray-900 bg-gray-50 border border-gray-200 placeholder:text-gray-400 focus:ring-2 focus:outline-none transition-all sm:leading-6 rounded-lg ${
                error
                  ? "ring-red-300 border-red-500"
                  : "ring-gray-300 focus:ring-primary"
              }`}
            />
          </div>
        ))}
      </div>
      {error && (
        <div className="text-red-500" id="code-input-error">
          {error}
        </div>
      )}
    </div>
  );
}
