const fs = require('fs');
const path = require('path');

// List of API route files that need fixing
const apiFiles = [
  'src/app/api/bookings/route.js',
  'src/app/api/payments/route.js',
  'src/app/api/bookings/[id]/route.js',
  'src/app/api/quotes/[id]/route.js',
  'src/app/api/leads/[id]/route.js',
  'src/app/api/customers/[id]/route.js'
];

// Function to fix a single file
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace CommonJS imports with ES6 imports
    content = content.replace(/const { NextResponse } = require\('next\/server'\)/g, "import { NextResponse } from 'next/server'");
    content = content.replace(/const db = require\('@\/lib\/database\.js'\)/g, "import { query, execute } from '@/lib/mysql'");
    content = content.replace(/const { verifyToken } = require\('@\/lib\/auth\.js'\)/g, "import { verifyToken } from '@/lib/auth'");
    content = content.replace(/const Joi = require\('joi'\)/g, "import Joi from 'joi'");
    content = content.replace(/const { v4: uuidv4 } = require\('uuid'\)/g, "import { v4 as uuidv4 } from 'uuid'");
    
    // Replace db.query with query
    content = content.replace(/db\.query/g, 'query');
    content = content.replace(/db\.execute/g, 'execute');
    
    // Write the fixed content back
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${filePath}`);
  } catch (error) {
    console.log(`❌ Error fixing ${filePath}: ${error.message}`);
  }
}

// Fix all files
console.log('🔧 Fixing API route files...');
apiFiles.forEach(fixFile);
console.log('✅ All API routes fixed!');
