"use client";

import React, { useState } from "react";
import Modal from "./Modal";

export interface PickerOption {
  id?: number | string; // اختیاری شد
  name: string;
}

interface PickerProps<T extends PickerOption> {
  items: T[] | null;
  placeholder: string;
  modalTitle: string;
  value?: T | null;
  onChange?: (item: T | null) => void;
  buttonClassName?: string;
  showClear?: boolean;
  clearText?: string;
  renderButton?: (props: {
    selected: T | null;
    onClick: () => void;
  }) => React.ReactNode;
  /** تابع برای رندر سفارشی هر آیتم در لیست */
  renderItem?: (item: T) => React.ReactNode;
}

function Picker<T extends PickerOption>({
  items,
  placeholder,
  modalTitle,
  value: externalValue = null,
  onChange,
  buttonClassName = "",
  showClear = true,
  clearText = "همه",
  renderButton,
  renderItem,
}: PickerProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<T | null>(externalValue);

  React.useEffect(() => {
    setInternalValue(externalValue);
  }, [externalValue]);

  const handleSelect = (item: T | null) => {
    setInternalValue(item);
    setIsOpen(false);
    if (onChange) onChange(item);
  };

  const displayName = internalValue?.name || placeholder;

  return (
    <>
      {/* دکمه */}
      {renderButton ? (
        renderButton({
          selected: internalValue,
          onClick: () => setIsOpen(true),
        })
      ) : (
        <button
          className={`w-full border px-2 py-2 text-right text-gray-400 ${buttonClassName}`}
          onClick={() => setIsOpen(true)}
        >
          <div className="flex-center-between text-gray-400">
            <p>{displayName}</p>
            <i className="fa fa-angle-left"></i>
          </div>
        </button>
      )}

      {/* مودال */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={modalTitle}
        size="md"
      >
        <ul className="space-y-2">
          {showClear && (
            <li>
              <button
                onClick={() => handleSelect(null)}
                className={`w-full text-right px-3 py-2 rounded-lg transition ${
                  internalValue === null
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {clearText}
              </button>
            </li>
          )}
          {items?.map((item, index) => {
            // استفاده از کلید مناسب
            const key =
              (item as any).slug || (item as any).id || `item-${index}`;
            return (
              <li key={key}>
                {renderItem ? (
                  // رندر سفارشی
                  <div
                    onClick={() => handleSelect(item)}
                    className="cursor-pointer"
                  >
                    {renderItem(item)}
                  </div>
                ) : (
                  <button
                    onClick={() => handleSelect(item)}
                    className={`w-full text-right px-3 py-2 rounded-lg transition ${
                      internalValue?.id === item.id
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    {item.name}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </Modal>
    </>
  );
}

export default Picker;
