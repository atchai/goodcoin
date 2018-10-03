
let program = {
    name: 'vscode',
    language: 'typescript'
  }
  
  let otherProperties = {
    sourceCode: 'https://github.com/Microsoft/vscode',
    license:  'MIT'
  }
  
  // Add properties to targetObjects
  function combine(targetObject, otherObject) {
    Object.assign(targetObject, otherObject)
  }
  
  combine(program, otherProperties)