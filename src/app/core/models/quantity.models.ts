export interface QuantityInput {
  value: number;
  unit: string;
  measurementType: string;
}

export interface AddRequest {
  first: QuantityInput;
  second: QuantityInput;
  resultUnit?: string;
}

export interface SubtractRequest {
  first: QuantityInput;
  second: QuantityInput;
  resultUnit?: string;
}

export interface DivideRequest {
  first: QuantityInput;
  second: QuantityInput;
}

export interface CompareRequest {
  first: QuantityInput;
  second: QuantityInput;
}

export interface ConvertRequest {
  source: QuantityInput;
  target: QuantityInput;
}

export interface QuantityMeasurementResponse {
  id: number;
  operation: string;
  measurementType: string;
  fromValue: number;
  fromUnit: string;
  toValue: number;
  toUnit: string;
  result: number;
  resultUnit: string;
  isError: boolean;
  errorMessage: string;
  createdAt: string;
}