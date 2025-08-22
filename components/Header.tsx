import React from 'react';

function Header(): React.ReactNode {
  return (
    <header className="py-6 px-4 md:px-8 bg-slate-900/50 backdrop-blur-sm border-b border-slate-700">
      <div className="container mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center">
          <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 text-transparent bg-clip-text">
            BudgetBot
          </span>
        </h1>
        <p className="text-center text-slate-400 mt-2 text-lg">
          Your personal financial analyst
        </p>
      </div>
    </header>
  );
}

export default Header;