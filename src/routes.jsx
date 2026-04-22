import {Navigate} from 'react-router-dom';

import Boards from './pages/boards';
import ESP32 from './pages/esp32';
import Domus from './pages/domus';

const routes = [
    {path: "/", element: <Navigate to="/esp32" />},

    {path: "/boards", element:
        <Boards/>
    },

    {path: "/esp32", element:
        <ESP32/>
    },

    {path: "/esp32/domus", element:
        <Domus/>
    },
];

export default routes;