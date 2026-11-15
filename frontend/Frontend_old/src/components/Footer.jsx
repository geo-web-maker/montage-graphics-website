import React from "react";
import { CONTACT } from "../data";

export default function Footer() {
  return (
    <footer>
      <span>Copyright © 2026 Montage Graphics</span>
      <span>{CONTACT.email}</span>
    </footer>
  );
}
