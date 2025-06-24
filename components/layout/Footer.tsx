import React from 'react'

export default function Footer() {
  return (
    <footer className="border-t border-black p-4 mt-auto">
      <div className="container mx-auto text-center text-sm">
        <p>© {new Date().getFullYear()} Counter App. All rights reserved.</p>
      </div>
    </footer>
  )
}
