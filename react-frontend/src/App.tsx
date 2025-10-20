import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Parse from './pages/Parse';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/parse" element={<Parse />} />
         <Route path="/shared/:sharedSlug" element={<Parse/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;