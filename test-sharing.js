// Test automatizado simple para validar la lógica de roles de compartición
const assert = require('assert')

function validateSharePermission(role) {
  const validRoles = ['viewer', 'editor']
  return validRoles.includes(role)
}

function getEffectivePermission(isOwner, role) {
  if (isOwner) return 'editor'
  return role || 'viewer'
}

console.log('Running automated tests for CollabDocs...')

// Test 1: Validar roles permitidos
assert.strictEqual(validateSharePermission('viewer'), true, 'El rol viewer debería ser válido')
assert.strictEqual(validateSharePermission('editor'), true, 'El rol editor debería ser válido')
assert.strictEqual(validateSharePermission('admin'), false, 'Roles desconocidos no deberían ser válidos')

// Test 2: Validar permisos efectivos del usuario
assert.strictEqual(getEffectivePermission(true, 'viewer'), 'editor', 'El dueño siempre debe tener permisos de editor')
assert.strictEqual(getEffectivePermission(false, 'viewer'), 'viewer', 'Un visor invitado debe conservar su rol viewer')

console.log('¡succesfull 🎉')