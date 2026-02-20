# EmailTemplateRender

A lightweight TypeScript utility for rendering dynamic email templates with support for variable interpolation, loop blocks, and conditional blank removal.

---

## Overview

`EmailTemplateRender` takes an HTML (or plain text) email template string and a data object, then produces a fully rendered output by:

- **Replacing `{placeholders}`** with scalar values (string, number, boolean, null)
- **Iterating loop blocks** (`{#eachKey}...{#endKey}`) over arrays of objects
- **Removing blank blocks** (`{#rmblank}...{#endrmblank}`) when a referenced key has no value

> **Note:** The class uses `isArray` from Node's built-in `util` module. If you're targeting a browser or modern Node environment, you can swap this for `Array.isArray()` without any behavior change.

---

## Installation & Setup

No extra packages needed beyond TypeScript and Node.js.

```ts
import { isArray } from "util";
import { EmailTemplateRender } from "./EmailTemplateRender";
```

---

## Template Syntax

| Syntax | Purpose |
|---|---|
| `{key}` | Replaced with the value of `key` from `data` |
| `{#eachItems}...{#endItems}` | Loops over the `Items` array; inner `{key}` refs resolve per-item |
| `{#rmblank}...{#endrmblank}` | The entire block is removed if any `{key}` inside it has no value |

---

## Basic Usage

### 1. Simple Variable Substitution

```ts
const renderer = new EmailTemplateRender({
  template: `<p>Hello {firstName}, your order {orderId} is confirmed!</p>`,
  data: {
    firstName: "Alice",
    orderId: "ORD-9821",
  },
});

const output = renderer.replacePlaceholders();
// <p>Hello Alice, your order ORD-9821 is confirmed!</p>
```

---

### 2. Loop Blocks (Arrays)

Use `{#eachKEY}` and `{#endKEY}` where `KEY` matches the array key in your data.

```ts
const renderer = new EmailTemplateRender({
  template: `
    <ul>
      {#eachitems}
        <li>{name} - {price}</li>
      {#enditems}
    </ul>
  `,
  data: {
    items: [
      { name: "Widget A", price: "$10.00" },
      { name: "Widget B", price: "$24.99" },
    ],
  },
});

const output = renderer.replacePlaceholders();
/*
  <ul>
    <li>Widget A - $10.00</li>
    <li>Widget B - $24.99</li>
  </ul>
*/
```

---

### 3. Conditional Blank Removal

Wrap optional content in `{#rmblank}...{#endrmblank}`. If any `{key}` inside the block is missing or falsy, the **entire block** is removed — including its surrounding HTML tag if present.

```ts
const renderer = new EmailTemplateRender({
  template: `
    <p>Hello {name}</p>
    <p>{#rmblank}Coupon Code: {coupon}{#endrmblank}</p>
  `,
  data: {
    name: "Bob",
    // coupon is not provided
  },
});

const output = renderer.replacePlaceholders();
/*
  <p>Hello Bob</p>
  <p></p>   ← the rmblank block is fully removed
*/
```

---

### 4. Full Combined Example

```ts
const renderer = new EmailTemplateRender({
  template: `
    <h1>Hi {customerName},</h1>
    <p>Thank you for your purchase!</p>
    <table>
      {#eachproducts}
        <tr>
          <td>{productName}</td>
          <td>{#rmblank}SKU: {sku}{#endrmblank}</td>
          <td>{qty} x {unitPrice}</td>
        </tr>
      {#endproducts}
    </table>
    <p>Total: {total}</p>
  `,
  data: {
    customerName: "Carol",
    total: "$89.97",
    products: [
      { productName: "Notebook", sku: "NB-001", qty: "2", unitPrice: "$12.99" },
      { productName: "Pen Set", sku: "",        qty: "1", unitPrice: "$63.99" },
    ],
  },
});

const output = renderer.replacePlaceholders();
// For "Pen Set", the SKU cell will be blank since sku is empty.
```

---

## API Reference

### `constructor(props)`

| Parameter | Type | Description |
|---|---|---|
| `props.template` | `string` | The raw template string |
| `props.data` | `Record<string, number \| boolean \| string \| null \| Array<Record<string, string>>>` | Key-value data to inject |

### `replacePlaceholders(): string`

Processes the template in this order:
1. Replaces loop blocks for all array values
2. Removes blank blocks where keys are missing
3. Substitutes all remaining `{key}` placeholders

Returns the fully rendered string.
