'use client';

import { useState } from 'react';

export default function SideMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const openAbout = () => {
    setIsAboutOpen(true);
    closeMenu();
  };

  const closeAbout = () => {
    setIsAboutOpen(false);
  };

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={toggleMenu}
        className="fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
        aria-label="תפריט"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Side Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={closeMenu}
        />
      )}

      {/* Side Menu */}
      <div className={`fixed top-0 right-0 z-50 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ${
        isMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-6">
          {/* Close Button */}
          <button
            onClick={closeMenu}
            className="mb-6 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="סגור תפריט"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Menu Items */}
          <nav className="space-y-4">
            <button
              onClick={openAbout}
              className="w-full text-right p-4 text-lg font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              אודות
            </button>
          </nav>
        </div>
      </div>

      {/* About Popup */}
      {isAboutOpen && (
        <div className="fixed inset-0 z-60 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-8">
              {/* Close Button */}
              <button
                onClick={closeAbout}
                className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="סגור"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Content */}
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">אודות האתר</h2>
              </div>

              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-4">
                <p>
                  האתר שלנו משתמש בכלי בינה מלאכותית מתקדמים לניתוח כתבות חדשות.
                  באמצעות אלגוריתמים חכמים, אנחנו מאזנים בין מקורות שונים, מאתרים את כל המידע הרלוונטי הקיים ברשת, ומארגנים אותו לכתבה חדשה, בהירה ואובייקטיבית.
                </p>
                
                <p>
                  המטרה שלנו היא לאפשר לך לקבל תמונה רחבה, אמינה ומדויקת יותר של המציאות – במקום להסתמך על מקור יחיד.
                </p>
              </div>

              {/* Close Button */}
              <div className="mt-8 text-center">
                <button
                  onClick={closeAbout}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  סגור
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
