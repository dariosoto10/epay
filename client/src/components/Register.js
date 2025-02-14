// @vendors
import React from 'react';

function Register({ form, updateForm, handleSubmit }) {
  return (
    <section className="register-section">
      <h2>Register Client</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Document"
          value={form.document}
          onChange={(e) => updateForm('document', e.target.value)}
        />
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => updateForm('name', e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => updateForm('email', e.target.value)}
        />
        <input
          type="tel"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => updateForm('phone', e.target.value)}
        />
        <button type="submit">Register</button>
      </form>
    </section>
  );
}

export default Register; 