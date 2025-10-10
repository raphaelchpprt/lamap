/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

// Étendre les types Jest pour inclure les matchers de @testing-library/jest-dom
import '@testing-library/jest-dom'

// Types personnalisés pour les tests LaMap
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveAttribute(attr: string, value?: string): R
      toHaveClass(...classNames: string[]): R
      toHaveStyle(style: Record<string, any>): R
      toBeVisible(): R
      toBeDisabled(): R
      toBeEnabled(): R
      toBeEmpty(): R
      toBeEmptyDOMElement(): R
      toContainElement(element: HTMLElement | null): R
      toContainHTML(html: string): R
      toHaveAccessibleDescription(description?: string | RegExp): R
      toHaveAccessibleName(name?: string | RegExp): R
      toHaveErrorMessage(message?: string | RegExp): R
      toHaveFocus(): R
      toHaveFormValues(values: Record<string, any>): R
      toHaveTextContent(text: string | RegExp, options?: { normalizeWhitespace: boolean }): R
      toHaveValue(value: string | string[] | number): R
      toHaveDisplayValue(value: string | RegExp | Array<string | RegExp>): R
      toBeChecked(): R
      toBePartiallyChecked(): R
      toHaveDescription(description?: string | RegExp): R
    }
  }
}

export {}
