import React, { useState } from 'react';
import { Link } from 'react-router';
import { MAIN_CATEGORIES } from '../lib/categories';
import { Search, ChevronRight } from 'lucide-react';

export function AllCategories() {
  const [search, setSearch] = useState('');

  const filteredCategories = MAIN_CATEGORIES.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.subcategories.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">All Categories</h1>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search categories or subcategories..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCategories.map(cat => {
          const Icon = cat.icon;
          return (
            <div key={cat.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
              <Link to={`/category/${cat.id}`} className="relative h-48 overflow-hidden block">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10 flex flex-col justify-end p-4">
                  <div className="flex items-center gap-2 text-white">
                    <Icon className="w-6 h-6" />
                    <h2 className="text-xl font-bold">{cat.name}</h2>
                  </div>
                </div>
              </Link>
              <div className="p-4 flex-1">
                <ul className="space-y-2">
                  {cat.subcategories.slice(0, 5).map(sub => (
                    <li key={sub}>
                      <Link to={`/category/${cat.id}?sub=${encodeURIComponent(sub)}`} className="text-sm text-gray-600 hover:text-indigo-600 flex items-center gap-1 group/link">
                        <ChevronRight className="w-3 h-3 opacity-0 -ml-4 group-hover/link:opacity-100 group-hover/link:ml-0 transition-all" />
                        {sub}
                      </Link>
                    </li>
                  ))}
                  {cat.subcategories.length > 5 && (
                    <li className="mt-2 pt-2 border-t border-gray-50">
                      <Link to={`/category/${cat.id}`} className="text-sm font-medium text-indigo-600 hover:underline inline-flex items-center gap-1">
                        View all <ChevronRight className="w-3 h-3" />
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
