import NavBar from '../components/marketing/Nav'
import { useState } from 'react'
import { mdxComponents } from '../utils/mdxComponents.jsx'
import { Listbox, ListboxItem } from "@heroui/react"

// Correct way to import all MDX files in a folder
const docs = import.meta.glob('../../docs/*.mdx', { eager: true })

function ApiDocsPage() {
  // Group documentation pages by category
  const groupedDocs = Object.entries(docs).reduce((acc, [path, doc]) => {
    const category = doc.category || 'General'
    if (!acc[category]) acc[category] = []
    const slug = path.replace('../../docs/', '').replace('.mdx', '')
    acc[category].push({ ...doc, slug })
    return acc
  }, {})

  const [activeDoc, setActiveDoc] = useState(
    groupedDocs[Object.keys(groupedDocs)[0]][0]
  )

  return (
    <div className="w-screen min-h-screen bg-gray-50 text-gray-800">
      <NavBar />
      <div className="max-w-7xl mx-auto flex py-9 px-6">
        {/* Sidebar Navigation */}
        <aside className="w-64 p-3">
          <h2 className="text-lg font-bold mb-4">API Docs</h2>
          <nav>
            {Object.entries(groupedDocs).map(([category, pages]) => (
              <div key={category} className="mb-6">
                <h6 className="text-md font-semibold text-gray-600 uppercase mb-2">
                  {category}
                </h6>
                <Listbox className="space-y-2">
                  {pages.map((page) => (
                    <ListboxItem
                      key={page.slug}
                      onClick={() => setActiveDoc(page)}
                      variant={activeDoc?.slug === page.slug ? 'flat' : 'solid'}
                    >
                      {page.title}
                    </ListboxItem>
                  ))}
                </Listbox>
              </div>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-6">
          <activeDoc.default components={mdxComponents} />
        </main>
      </div>
    </div>
  )
}

export default ApiDocsPage
