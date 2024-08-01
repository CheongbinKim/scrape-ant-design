
import React, { useEffect, useState } from 'react';

const fetchProps = async () => {
  const response = await fetch('/docs/Button.json');
  if (!response.ok) {
    throw new Error('Failed to fetch Button props');
  }
  return response.json();
};

const ButtonDocs = () => {
  const [props, setProps] = useState([]);

  useEffect(() => {
    fetchProps().then(setProps).catch(console.error);
  }, []);

  return (
    <div>
      <h1>Button Component</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Description</th>
            <th>Default</th>
          </tr>
        </thead>
        <tbody>
          {props.map((prop) => (
            <tr key={prop.name}>
              <td>{prop.name}</td>
              <td>{prop.type}</td>
              <td>{prop.description}</td>
              <td>{prop.defaultValue === null ? 'N/A' : prop.defaultValue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ButtonDocs;
