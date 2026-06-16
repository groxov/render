export function splitSqlStatements(schema: string) {
  const statements: string[] = [];
  let currentStatement = '';
  let inString = false;
  let stringChar = '';

  for (let index = 0; index < schema.length; index += 1) {
    const char = schema[index];
    const nextChar = schema[index + 1];

    if (!inString && (char === '"' || char === "'")) {
      inString = true;
      stringChar = char;
      currentStatement += char;
      continue;
    }

    if (inString && char === stringChar && schema[index - 1] !== '\\') {
      inString = false;
      currentStatement += char;
      continue;
    }

    if (!inString && char === ';') {
      if (currentStatement.trim()) {
        statements.push(currentStatement.trim());
      }
      currentStatement = '';
      continue;
    }

    if (!inString && char === '-' && nextChar === '-') {
      while (index < schema.length && schema[index] !== '\n') {
        index += 1;
      }
      continue;
    }

    if (!inString && char === '/' && nextChar === '*') {
      index += 2;
      while (index < schema.length - 1) {
        if (schema[index] === '*' && schema[index + 1] === '/') {
          index += 1;
          break;
        }
        index += 1;
      }
      continue;
    }

    currentStatement += char;
  }

  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }

  return statements;
}
