import { type PlateElementProps, PlateElement } from 'platejs/react';

export function CustomButtonElement(props: PlateElementProps) {
  return (
    <PlateElement
      as="button"
      className="px-4 py-2 bg-blue-500 text-white rounded"
      {...props}
    />
  );
}
