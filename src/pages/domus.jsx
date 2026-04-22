import {useEffect, useRef, useState} from 'react';
import {listenESP32, listenLights, listenActuators, toggleESP32, toggleLight, toggleActuator} from '../firebase/firebase';
import styles from '../styles/domus/domus.module.css';
import stylesHome from '../styles/domus/home.module.css';
import stylesLights from '../styles/domus/lights.module.css';
import stylesElevator from '../styles/domus/elevator.module.css';
import stylesDoors from '../styles/domus/doors.module.css';
import stylesPool from '../styles/domus/pool.module.css';
import stylesWeather from '../styles/domus/weather.module.css';
import Switch from '../components/switch/switch';
import Loader from '../components/loader/loader';

const Domus = () => {
    useEffect(() => {
        document.title = "DOMUS";
    }, []);

    const [screen, setScreen] = useState("");
    const [guard, setGuard] = useState(true);
    const [admin, setAdmin] = useState(false);
    const [showCode, setShowCode] = useState(false);
    const [section, setSection] = useState("home");
    const [loading, setLoading] = useState(true);
    const [ESP32, setESP32] = useState([]);
    const [lights, setLights] = useState([]);
    const [actuators, setActuators] = useState([]);
    const [isMoving, setIsMoving] = useState(false);
    const [moreButtonActive, setMoreButtonActive] = useState(false);

    // LISTENERS
    useEffect(() => {
        const unsubscribeESP32 = listenESP32((data) => {
            setESP32(data);
            setLoading(false);
        });
        const unsubscribeLights = listenLights((data) => {
            setLights(data);
            setLoading(false);
        });
        const unsubscribeActuators = listenActuators((data) => {
            setActuators(data);
            setLoading(false);
        });

        return () => {
            unsubscribeESP32();
            unsubscribeLights();
            unsubscribeActuators();
        };
    }, []);
    useEffect(() => {
        const handleResize = () => {
            setScreen(window.innerWidth <= 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [])

    // isMoving, GUARD with handleToggleShowCode and handleClickOutside
    const firstRender = useRef(true);
    const prevElevator = useRef();
    const prevCode = useRef();
    useEffect(() => {
        if(firstRender.current){
            firstRender.current = false;
            prevElevator.current = actuators.elevator;
            return;
        }
        if(prevElevator.current === undefined || actuators.elevator === undefined){
            prevElevator.current = actuators.elevator;
            return;
        }

        if(prevElevator.current !== actuators.elevator){
            // eslint-disable-next-line
            setIsMoving(true);
            const timer = setTimeout(() => setIsMoving(false), 3000);
            prevElevator.current = actuators.elevator;
            return () => clearTimeout(timer);
        }
        prevElevator.current = actuators.elevator;
    }, [actuators.elevator]);

    useEffect(() => {
        if(firstRender.current){
            firstRender.current = false;
            prevCode.current = ESP32.code;
            return;
        }
        if(prevCode.current === undefined || ESP32.code === undefined){
            prevCode.current = ESP32.code;
            return;
        }

        if(!admin && prevCode.current !== ESP32.code){
            // eslint-disable-next-line
            setGuard(true);
            prevCode.current = ESP32.code;
        }
        prevCode.current = ESP32.code;
        // eslint-disable-next-line
    }, [ESP32.code]);

    let pressTimer;
    useEffect(() => {
        const handleToggleShowCode = (e) => {
            if(e.ctrlKey && e.altKey && e.key === "k"){
                setShowCode(prev => !prev);
            }
        };
        window.addEventListener("keydown", handleToggleShowCode);
        return () => window.removeEventListener("keydown", handleToggleShowCode);
    }, []);

    const menuRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (e) => {
            if(menuRef.current && !menuRef.current.contains(e.target)){
                setMoreButtonActive(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return() => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // TOGGLES
    const handleToggleESP32 = async(location, value) => {
        if(!ESP32.state && location !== "code"){
            return;
        }
        
        try{
            setESP32(prev => ({
                ...prev,
                [location]: value,
            }));
            await toggleESP32(location, value);
        } catch(error){
            console.log("Error:" + error.code);
        }
    }
    const handleToggleLight = async(location, value) => {
        if(!ESP32.state){
            return;
        }

        try{
            setLights(prev => ({
                ...prev,
                [location]: value,
            }));
            await toggleLight(location, value);
        } catch(error){
            console.log("Error:" + error.code);
        }
    }
    const handleToggleActuator = async(location, value) => {
        if(!ESP32.state){
            return;
        }
        
        try{
            setActuators(prev => ({
                ...prev,
                [location]: value,
            }));
            await toggleActuator(location, value);
        } catch(error){
            console.log("Error:" + error.code);
        }
    }
    
    // RETURNS
    if(loading){
        return <div style={{display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", width: "100%"}}>
                    <Loader/>
                </div>
    }
    if(!loading && guard){
        return(
            <div id={styles.guard}>
                <div id={styles.codeInput}>
                    <input type="password" title="" required onChange={(e) => {
                        if(e.target.value === "314159265"){
                            setAdmin(true);
                            setGuard(false);
                        }
                        if(e.target.value === ESP32.code){
                            setGuard(false);
                        }
                    }}/>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M12 13a1.49 1.49 0 0 0-1 2.61V17a1 1 0 0 0 2 0v-1.39A1.49 1.49 0 0 0 12 13m5-4V7A5 5 0 0 0 7 7v2a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3M9 7a3 3 0 0 1 6 0v2H9Zm9 12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1Z" />
                    </svg>
                    <label>CÓDIGO (1234)</label>
                </div>
            </div>
        );
    }

    return(
        <div id={styles.MainContainer}>
            <div id={styles.head}>
                <div id={styles.title}>
                    <svg onTouchStart={() => {pressTimer = setTimeout(() => setShowCode(prev => !prev), 1000);}} onTouchEnd={() => clearTimeout(pressTimer)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                    <p>DOMUS {!screen && " - Casa Inteligente"}</p>
                    {admin && showCode && screen ? (<button onClick={() => handleToggleESP32("code", String(Math.floor(Math.random() * 9000)+1000))}>Code: {ESP32.code}</button>) : null}
                </div>

                <div id={styles.generalInfo}>
                    <div id={styles.row}>
                        <div className={styles.ESP32State} style={{transition: "all 1s", color: ESP32.state ? "rgb(52, 211, 153)" : "var(--oqText)"}}>
                            <div className={`${styles.dot} ${ESP32.state ? styles.dotEnabled : styles.dotDisabled}`}/>
                            <p>{ESP32.state ? "ESP32 Conectada" : "ESP32 Desconectada"}</p>
                        </div>

                        <div className={styles.lightsState} style={{color: "hsl(44 100% 47%)"}}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>
                            <p>{Object.values(lights).filter(value => value === true).length}/10 Luces</p>
                        </div>

                        <div className={styles.elevatorState} style={{color: "rgb(139, 92, 246)"}}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
                            <p>Piso {actuators.elevator}</p>
                        </div>
                    </div>

                    <div id={styles.row}>
                        <div className={styles.doorsState} style={{color: "hsl(144 100% 39%)"}}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 4h3a2 2 0 0 1 2 2v14"></path><path d="M2 20h3"></path><path d="M13 20h9"></path><path d="M10 12v.01"></path><path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561Z"></path></svg>
                            <p>{[actuators.mainDoor, actuators.garageDoor].filter(value => value === true).length}/2 Puertas</p>
                        </div>

                        <div className={styles.poolState} style={{color: "rgb(59, 130, 246)"}}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path></svg>
                            <p>Chorro {actuators.fountain !== 0 ? "encendido" : "detenido"}</p>
                        </div>

                        <div className={styles.weatherState} style={{color: "hsl(189 100% 43%)"}}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m8 4v10.54c1.57 0.91 2.33 2.75 1.86 4.5-0.46 1.75-2.05 2.96-3.86 2.96-1.81 0-3.4-1.21-3.86-2.96-0.47-1.75 0.29-3.59 1.86-4.5v-10.54c0-0.53 0.21-1.04 0.59-1.41 0.37-0.38 0.88-0.59 1.41-0.59 0.53 0 1.04 0.21 1.41 0.59 0.38 0.37 0.59 0.88 0.59 1.41z"/></svg>
                            <p>--°C</p>
                        </div>

                        {admin && showCode && !screen ? (<button onClick={() => handleToggleESP32("code", String(Math.floor(Math.random() * 9000)+1000))}>Code: {ESP32.code}</button>) : null}
                    </div>
                </div>
            </div>

            <div id={styles.bar}>
                <button className={`${styles.barButton} ${section === "home" && styles.activeBarButton}`} onClick={() => setSection("home")}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                    Resumen
                </button>

                <button className={`${styles.barButton} ${section === "lights" && styles.activeBarButton}`} onClick={() => setSection("lights")}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>
                    Luces
                </button>

                {screen && (
                    <div id={styles.moreButton} ref={menuRef}>
                        <div>
                            <input className={styles.checkbox} type="checkbox" checked={moreButtonActive} onChange={() => setMoreButtonActive(!moreButtonActive)}/>
                            <span className={styles.buttonMenu}/>

                            <button className={`${styles.option} ${styles.optionA} ${section === "pool" && styles.activePlus}`} onClick={() => setSection("pool")}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path></svg>
                                Piscina
                            </button>
                            <button className={`${styles.option} ${styles.optionB} ${section === "weather" && styles.activePlus}`} onClick={() => setSection("weather")}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"></path><path d="M9.6 4.6A2 2 0 1 1 11 8H2"></path><path d="M12.6 19.4A2 2 0 1 0 14 16H2"></path></svg>
                                Clima
                            </button>
                        </div>

                        <p>MÁS</p>
                    </div>
                )}

                <button className={`${styles.barButton} ${section === "elevator" && styles.activeBarButton}`} onClick={() => setSection("elevator")}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
                    Ascensor
                </button>

                <button className={`${styles.barButton} ${section === "doors" && styles.activeBarButton}`} onClick={() => setSection("doors")}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 4h3a2 2 0 0 1 2 2v14"></path><path d="M2 20h3"></path><path d="M13 20h9"></path><path d="M10 12v.01"></path><path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561Z"></path></svg>
                    Puertas
                </button>

                {!screen && (
                    <>
                        <button className={`${styles.barButton} ${section === "pool" && styles.activeBarButton}`} onClick={() => setSection("pool")}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path></svg>
                            Piscina
                        </button>
                        
                        <button className={`${styles.barButton} ${section === "weather" && styles.activeBarButton}`} onClick={() => setSection("weather")}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"></path><path d="M9.6 4.6A2 2 0 1 1 11 8H2"></path><path d="M12.6 19.4A2 2 0 1 0 14 16H2"></path></svg>
                            Clima
                        </button>
                    </>
                )}
                
            </div>

            {section === "home" && (
               <>
                    <div id={stylesHome.homeSection}>
                        <div id={stylesHome.row}>
                            <button id={stylesHome.cardInfo} onClick={() => {if(!screen)setSection("lights"); else setTimeout(() => setSection("lights"), 500)}}>
                                <div id={stylesHome.cardTitle}>
                                    <div>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="hsl(44 100% 47%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>
                                        <p>{!screen ? "Control de Luces" : "Luces"}</p>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"></path></svg>
                                </div>
                                <div id={stylesHome.cardBody}>
                                    <p>{Object.values(lights).filter(value => value === true).length}/10</p>
                                    <p>Luces encendidas</p>
                                </div>
                            </button>

                            <button id={stylesHome.cardInfo} onClick={() => {if(!screen)setSection("elevator"); else setTimeout(() => setSection("elevator"), 500)}}>
                                <div id={stylesHome.cardTitle}>
                                    <div>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="rgb(139, 92, 246)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
                                        <p>Ascensor</p>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"></path></svg>
                                </div>
                                <div id={stylesHome.cardBody}>
                                    <p>Piso {actuators.elevator}</p>
                                    <p>{isMoving ? "En movimiento..." : "Detenido"}</p>
                                </div>
                            </button>

                            {!screen && (
                                <button id={stylesHome.cardInfo} onClick={() => {if(!screen)setSection("doors"); else setTimeout(() => setSection("doors"), 500)}}>
                                    <div id={stylesHome.cardTitle}>
                                        <div>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="hsl(144 100% 39%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 4h3a2 2 0 0 1 2 2v14"></path><path d="M2 20h3"></path><path d="M13 20h9"></path><path d="M10 12v.01"></path><path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561Z"></path></svg>
                                            <p>{!screen ? "Control de Puertas" : "Puertas"}</p>
                                        </div>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"></path></svg>
                                    </div>
                                    <div id={stylesHome.cardBody} style={{gap: "5px"}}>
                                        <div id={stylesHome.row2}>
                                            <p>{!screen ? "Puerta Principal" : "Principal"}</p>
                                            <div className={actuators.mainDoor ? stylesHome.doorClosed : stylesHome.doorOpened}>{actuators.mainDoor ? "Cerrada" : "Abierta"}</div>
                                        </div>
                                        <div id={stylesHome.row2}>
                                            <p>{!screen ? "Puerta del Garaje" : "Garaje"}</p>
                                            <div className={actuators.garageDoor ? stylesHome.doorClosed : stylesHome.doorOpened}>{actuators.garageDoor ? "Cerrada" : "Abierta"}</div>
                                        </div>
                                    </div>
                                </button>
                            )}
                        </div>

                        <div id={stylesHome.row}>
                            {screen && (
                                <button id={stylesHome.cardInfo} onClick={() => {if(!screen)setSection("doors"); else setTimeout(() => setSection("doors"), 500)}}>
                                    <div id={stylesHome.cardTitle}>
                                        <div>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="hsl(144 100% 39%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 4h3a2 2 0 0 1 2 2v14"></path><path d="M2 20h3"></path><path d="M13 20h9"></path><path d="M10 12v.01"></path><path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561Z"></path></svg>
                                            <p>{!screen ? "Control de Puertas" : "Puertas"}</p>
                                        </div>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"></path></svg>
                                    </div>
                                    <div id={stylesHome.cardBody} style={{gap: "5px"}}>
                                        <div id={stylesHome.row2}>
                                            <p>{!screen ? "Puerta Principal" : "Principal"}</p>
                                            <div className={actuators.mainDoor ? stylesHome.doorClosed : stylesHome.doorOpened}>{actuators.mainDoor ? "Cerrada" : "Abierta"}</div>
                                        </div>
                                        <div id={stylesHome.row2}>
                                            <p>{!screen ? "Puerta del Garaje" : "Garaje"}</p>
                                            <div className={actuators.garageDoor ? stylesHome.doorClosed : stylesHome.doorOpened}>{actuators.garageDoor ? "Cerrada" : "Abierta"}</div>
                                        </div>
                                    </div>
                                </button>
                            )}

                            <button id={stylesHome.cardInfo} onClick={() => {if(!screen)setSection("pool"); else setTimeout(() => setSection("pool"), 500)}}>
                                <div id={stylesHome.cardTitle}>
                                    <div>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="hsl(216 100% 58%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path></svg>
                                        <p>{!screen ? "Sistema de Piscina" : "Piscina"}</p>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"></path></svg>
                                </div>
                                <div id={stylesHome.cardBody}>
                                    <p>--</p>
                                    <p>-----</p>
                                </div>
                            </button>

                            {!screen && (
                                <button id={stylesHome.cardInfo} onClick={() => {if(!screen)setSection("weather"); else setTimeout(() => setSection("weather"), 500)}}>
                                    <div id={stylesHome.cardTitle}>
                                        <div>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="hsl(189 100% 43%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"></path><path d="M9.6 4.6A2 2 0 1 1 11 8H2"></path><path d="M12.6 19.4A2 2 0 1 0 14 16H2"></path></svg>
                                            <p>Climatización</p>
                                        </div>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"></path></svg>
                                    </div>
                                    <div id={stylesHome.cardBody}>
                                        <p>--</p>
                                        <p>-----</p>
                                    </div>
                                </button>
                            )}
                        </div>
                        
                        {screen && (
                            <div id={stylesHome.row}>
                                <button id={stylesHome.cardInfo} onClick={() => {if(!screen)setSection("weather"); else setTimeout(() => setSection("weather"), 500)}}>
                                    <div id={stylesHome.cardTitle}>
                                        <div>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="hsl(189 100% 43%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"></path><path d="M9.6 4.6A2 2 0 1 1 11 8H2"></path><path d="M12.6 19.4A2 2 0 1 0 14 16H2"></path></svg>
                                            <p>Climatización</p>
                                        </div>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"></path></svg>
                                    </div>
                                    <div id={stylesHome.cardBody}>
                                        <p>--</p>
                                        <p>-----</p>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
               </>
            )}

            {section === "lights" && (
                <div id={stylesLights.lightsSection}>
                    <div id={stylesLights.titleSection}>
                        <p>Control de Luces</p>
                        <div id={stylesLights.titleInfo}>
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="hsl(44 100% 47%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>
                                <p>Nivel de luz: {!ESP32.state ? "--" : Math.max(0, (((ESP32.lightLevel - 2300) / (4095 - 2300)) * 70 + 30)).toFixed(0)}%</p>
                            </div>
                        </div>
                    </div>

                    {/*<div id={stylesLights.autoModeContainer}>
                        <div id={stylesLights.autoModeTitle}>
                            <div>
                                <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="rgb(59, 130, 246)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"></path></svg>
                                    <p>Modo Automático</p>
                                </div>
                                <Switch className={ESP32.state === false && styles.ESP32Disabled} checked={ESP32.lightsAutoMode} onChange={() => handleToggleESP32("lightsAutoMode", !ESP32.lightsAutoMode)}/>
                            </div>
                            <p>Las luces se encenderán automáticamente cuando el nivel de luz sea menor a 30%</p>
                        </div>
                    </div>*/}

                    <div/>

                    <div id={stylesLights.lightsCards}>
                        <div id={stylesLights.floor}>
                            <p>SEGUNDO PISO</p>

                            <div id={stylesLights.row}>
                                <div id={stylesLights.card}>
                                    <div id={stylesLights.cardTitle}>
                                        <div>
                                            <svg className={lights.privBedroom ? stylesDoors.lightOn : stylesDoors.lightOff} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>
                                            <p>Habitación {screen && <br/>} Privada</p>
                                        </div>
                                        <Switch className={ESP32.state === false && styles.ESP32Disabled} checked={lights.privBedroom} onChange={() => handleToggleLight("privBedroom", !lights.privBedroom)}/>
                                    </div>
                                </div>

                                <div id={stylesLights.card}>
                                    <div id={stylesLights.cardTitle}>
                                        <div>
                                            <svg className={lights.bedroom1 ? stylesDoors.lightOn : stylesDoors.lightOff} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>
                                            <p>Habitación {screen && <br/>} 1</p>
                                        </div>
                                        <Switch className={ESP32.state === false && styles.ESP32Disabled} checked={lights.bedroom1} onChange={() => handleToggleLight("bedroom1", !lights.bedroom1)}/>
                                    </div>
                                </div>

                                <div id={stylesLights.card}>
                                    <div id={stylesLights.cardTitle}>
                                        <div>
                                            <svg className={lights.bedroom2 ? stylesDoors.lightOn : stylesDoors.lightOff} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>
                                            <p>Habitación {screen && <br/>} 2</p>
                                        </div>
                                        <Switch className={ESP32.state === false && styles.ESP32Disabled} checked={lights.bedroom2} onChange={() => handleToggleLight("bedroom2", !lights.bedroom2)}/>
                                    </div>
                                </div>
                            </div>

                            <div id={stylesLights.row}>
                                <div id={stylesLights.card}>
                                    <div id={stylesLights.cardTitle}>
                                        <div>
                                            <svg className={lights.bath ? stylesDoors.lightOn : stylesDoors.lightOff} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>
                                            <p>Baño</p>
                                        </div>
                                        <Switch className={ESP32.state === false && styles.ESP32Disabled} checked={lights.bath} onChange={() => handleToggleLight("bath", !lights.bath)}/>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div id={stylesLights.floor}>
                            <p>PRIMER PISO</p>

                            <div id={stylesLights.row}>
                                <div id={stylesLights.card}>
                                    <div id={stylesLights.cardTitle}>
                                        <div>
                                            <svg className={lights.garage ? stylesDoors.lightOn : stylesDoors.lightOff} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>
                                            <p>Garaje</p>
                                        </div>
                                        <Switch className={ESP32.state === false && styles.ESP32Disabled} checked={lights.garage} onChange={() => handleToggleLight("garage", !lights.garage)}/>
                                    </div>
                                </div>

                                <div id={stylesLights.card}>
                                    <div id={stylesLights.cardTitle}>
                                        <div>
                                            <svg className={lights.hall ? stylesDoors.lightOn : stylesDoors.lightOff} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>
                                            <p>Sala</p>
                                        </div>
                                        <Switch className={ESP32.state === false && styles.ESP32Disabled} checked={lights.hall} onChange={() => handleToggleLight("hall", !lights.hall)}/>
                                    </div>
                                </div>

                                <div id={stylesLights.card}>
                                    <div id={stylesLights.cardTitle}>
                                        <div>
                                            <svg className={lights.kitchen ? stylesDoors.lightOn : stylesDoors.lightOff} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>
                                            <p>Cocina</p>
                                        </div>
                                        <Switch className={ESP32.state === false && styles.ESP32Disabled} checked={lights.kitchen} onChange={() => handleToggleLight("kitchen", !lights.kitchen)}/>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div id={stylesLights.floor}>
                            <p>EXTERIOR</p>

                            <div id={stylesLights.row}>
                                <div id={stylesLights.card}>
                                    <div id={stylesLights.cardTitle}>
                                        <div>
                                            <svg className={lights.entrance ? stylesDoors.lightOn : stylesDoors.lightOff} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>
                                            <p>Entrada</p>
                                        </div>
                                        <Switch className={ESP32.state === false || ESP32.lightsAutoMode ? styles.ESP32Disabled : undefined} checked={lights.entrance} onChange={() => handleToggleLight("entrance", !lights.entrance)}/>
                                    </div>
                                </div>
                                
                                <div id={stylesLights.card}>
                                    <div id={stylesLights.cardTitle}>
                                        <div>
                                            <svg className={lights.yard ? stylesDoors.lightOn : stylesDoors.lightOff} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>
                                            <p>Patio</p>
                                        </div>
                                        <Switch className={ESP32.state === false || ESP32.lightsAutoMode ? styles.ESP32Disabled : undefined} checked={lights.yard} onChange={() => handleToggleLight("yard", !lights.yard)}/>
                                    </div>
                                </div>

                                <div id={stylesLights.card}>
                                    <div id={stylesLights.cardTitle}>
                                        <div>
                                            <svg className={lights.pool ? stylesDoors.lightOn : stylesDoors.lightOff} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>
                                            <p>Piscina</p>
                                        </div>
                                        <Switch className={ESP32.state === false || ESP32.lightsAutoMode ? styles.ESP32Disabled : undefined} checked={lights.pool} onChange={() => handleToggleLight("pool", !lights.pool)}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {section === "elevator" && (
                <div id={stylesElevator.elevatorSection}>
                    <div id={stylesElevator.titleSection}>
                        <p>Control de Ascensor</p>
                    </div>
                    
                    <div id={stylesElevator.card}>
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
                            <p>Estado del Ascensor</p>
                        </div>

                        <div id={stylesElevator.graphicContainer}>
                            <div id={stylesElevator.graphicFloor}></div>
                            <div id={stylesElevator.graphicFloor}></div>

                            <div id={stylesElevator.elevator}>
                                <svg className={`${actuators.elevator === 1 ? stylesElevator.firstFloor : stylesElevator.secondFloor} ${isMoving && stylesElevator.isMoving}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 20"><path fill="rgb(59, 130, 246)" d="m2 20q-0.82 0-1.41-0.65-0.59-0.65-0.59-1.57v-15.56q0-0.91 0.59-1.57 0.59-0.65 1.41-0.65h14q0.83 0 1.41 0.65 0.59 0.66 0.59 1.57v15.56q0 0.91-0.59 1.57-0.58 0.65-1.41 0.65zm3.5-13.89q0.53 0 0.89-0.4 0.36-0.41 0.36-0.99 0-0.58-0.36-0.98-0.37-0.41-0.89-0.41-0.52 0.01-0.89 0.41-0.36 0.4-0.36 0.98 0 0.59 0.36 0.99 0.37 0.4 0.89 0.4zm4.5 2.78h5l-2.5-4.45zm2.5 6.67l2.5-4.44h-5zm-8.5 1.11h3v-4.45h1v-2.77q0-0.92-0.59-1.57-0.58-0.66-1.41-0.66h-1q-0.83 0-1.41 0.66-0.59 0.65-0.59 1.57v2.77h1z"/></svg>
                            </div>
                        </div>

                        <div id={stylesElevator.buttonsSection}>
                            <div id={stylesElevator.titleButtonsSection}>
                                <p>Llamar Ascensor</p>
                                <p>Selecciona el piso de destino</p>
                            </div>

                            <div id={stylesElevator.buttons} className={ESP32.state === false ? styles.ESP32Disabled : undefined}>
                                <button className={`${stylesElevator.button} ${actuators.elevator === 1 && stylesElevator.activeButton} ${isMoving && stylesElevator.isMoving}`} onClick={() => handleToggleActuator("elevator", 1)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none"><path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"></path><path fill="currentColor" d="M10.5 16.035L7.404 12.94a1.5 1.5 0 1 0-2.122 2.121l5.657 5.657a1.5 1.5 0 0 0 2.122 0l5.657-5.656a1.5 1.5 0 1 0-2.122-2.122L13.5 16.035V4.5a1.5 1.5 0 0 0-3 0z"></path></g></svg>
                                    <p>1</p>
                                    <p>Primer Piso</p>
                                </button>

                                <button className={`${stylesElevator.button} ${actuators.elevator === 2 && stylesElevator.activeButton} ${isMoving && stylesElevator.isMoving}`} onClick={() => handleToggleActuator("elevator", 2)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none"><path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"></path><path fill="currentColor" d="M13.06 3.283a1.5 1.5 0 0 0-2.12 0L5.281 8.939a1.5 1.5 0 0 0 2.122 2.122L10.5 7.965V19.5a1.5 1.5 0 0 0 3 0V7.965l3.096 3.096a1.5 1.5 0 1 0 2.122-2.122z"></path></g></svg>
                                    <p>2</p>
                                    <p>Segundo Piso</p>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {section === "doors" && (
                <div id={stylesDoors.doorsSection}>
                    <div id={stylesDoors.titleSection}>
                        <p>Control de Puertas</p>
                    </div>

                    <div id={stylesDoors.doorsCards}>
                        <div id={stylesDoors.card}>
                            <div id={stylesDoors.titleCard}>
                                {actuators.mainDoor ?
                                    <svg className={stylesDoors.doorClosed} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14"></path><path d="M2 20h20"></path><path d="M14 12v.01"></path></svg>
                                :
                                    <svg className={stylesDoors.doorOpened} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 4h3a2 2 0 0 1 2 2v14"></path><path d="M2 20h3"></path><path d="M13 20h9"></path><path d="M10 12v.01"></path><path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561Z"></path></svg>
                                }
                                <div>
                                    <p>Puerta Principal</p>
                                    <div className={actuators.mainDoor ? stylesDoors.doorClosed : stylesDoors.doorOpened}>{actuators.mainDoor ? "Cerrada" : "Abierta"}</div>
                                </div>
                            </div>

                            <div id={stylesDoors.controlSection}>
                                <button className={`${actuators.mainDoor ? stylesDoors.openDoor : stylesDoors.closeDoor} ${ESP32.state === false && styles.ESP32Disabled}`} onClick={() => handleToggleActuator("mainDoor", !actuators.mainDoor)}>
                                    {actuators.mainDoor ?
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 4h3a2 2 0 0 1 2 2v14"></path><path d="M2 20h3"></path><path d="M13 20h9"></path><path d="M10 12v.01"></path><path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561Z"></path></svg>
                                    :
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14"></path><path d="M2 20h20"></path><path d="M14 12v.01"></path></svg>
                                    }
                                    {actuators.mainDoor ? "ABRIR PUERTA" : "CERRAR PUERTA"}
                                </button>

                                <div id={stylesDoors.lightContainer}>
                                    <svg className={lights.entrance ? stylesDoors.lightOn : stylesDoors.lightOff} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>
                                    <Switch className={ESP32.state === false && styles.ESP32Disabled} checked={lights.entrance} onChange={() => handleToggleLight("entrance", !lights.entrance)}/>
                                </div>
                            </div>
                        </div>

                        <div id={stylesDoors.card}>
                            <div id={stylesDoors.titleCard}>
                                {actuators.garageDoor ?
                                    <svg className={stylesDoors.doorClosed} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14"></path><path d="M2 20h20"></path><path d="M14 12v.01"></path></svg>
                                :
                                    <svg className={stylesDoors.doorOpened} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 4h3a2 2 0 0 1 2 2v14"></path><path d="M2 20h3"></path><path d="M13 20h9"></path><path d="M10 12v.01"></path><path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561Z"></path></svg>
                                }
                                <div>
                                    <p>Garaje</p>
                                    <div className={actuators.garageDoor ? stylesDoors.doorClosed : stylesDoors.doorOpened}>{actuators.garageDoor ? "Cerrada" : "Abierta"}</div>
                                </div>
                            </div>

                            <div id={stylesDoors.controlSection}>
                                <button className={`${actuators.garageDoor ? stylesDoors.openDoor : stylesDoors.closeDoor} ${ESP32.state === false && styles.ESP32Disabled}`} onClick={() => handleToggleActuator("garageDoor", !actuators.garageDoor)}>
                                    {actuators.garageDoor ?
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 4h3a2 2 0 0 1 2 2v14"></path><path d="M2 20h3"></path><path d="M13 20h9"></path><path d="M10 12v.01"></path><path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561Z"></path></svg>
                                    :
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14"></path><path d="M2 20h20"></path><path d="M14 12v.01"></path></svg>
                                    }
                                    {actuators.garageDoor ? "ABRIR PUERTA" : "CERRAR PUERTA"}
                                </button>

                                <div id={stylesDoors.lightContainer}>
                                    <svg className={lights.garage ? stylesDoors.lightOn : stylesDoors.lightOff} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>
                                    <Switch className={ESP32.state === false && styles.ESP32Disabled} checked={lights.garage} onChange={() => handleToggleLight("garage", !lights.garage)}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {section === "pool" && (
                <div id={stylesPool.poolSection}>
                    <div id={stylesPool.titleSection}>
                        <p>Sistema de Piscina</p>
                    </div>

                    <div id={stylesPool.card}>
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path></svg>
                            <p>Control de Piscina</p>
                        </div>

                        <div id={stylesPool.controlSection}>
                            <div id={stylesPool.jetContainer}>
                                <div id={stylesPool.jetHead}>
                                    <div>
                                        <svg className={`${actuators.fountain !== 0 ? stylesPool.jetOn : stylesPool.jetOff} ${styles.ESP32Disabled}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path></svg>                                    
                                        <p>Chorro de Agua</p>
                                    </div>
                                    <Switch className={ESP32.state === false && styles.ESP32Disabled} checked={actuators.fountain !== 0} onChange={() => handleToggleActuator("fountain", (actuators.fountain === 0 ? 127.5 : 0))}/>
                                </div>
                                
                                {actuators.fountain !== 0 && (
                                    <div id={stylesPool.jetPowerContainer}>
                                        <div id={stylesPool.jetPowerHead}>
                                            <p>Potencia del Chorro</p>
                                            <div>{(actuators.fountain/255*100).toFixed(0)}%</div>
                                        </div>
                                        <input className={ESP32.state === false ? styles.ESP32Disabled : undefined} type="range" min={0} max={255} value={actuators.fountain} onChange={(e) => handleToggleActuator("fountain", Number(e.target.value))}/>
                                        <div id={stylesPool.jetPowerLevels}>
                                            <p>💧 Suave</p><p>💦 Medio</p><p>🌊 Fuerte</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div id={stylesPool.lightContainer}>
                                <svg className={lights.pool ? stylesPool.lightOn : stylesPool.lightOff} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>
                                <Switch className={ESP32.state === false && styles.ESP32Disabled} checked={lights.pool} onChange={() => handleToggleLight("pool", !lights.pool)}/>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {section === "weather" && (
                <div id={stylesWeather.weatherSection}>
                    <div id={stylesWeather.titleSection}>
                        <p>Climatización</p>
                    </div>

                    <div id={stylesWeather.card}>
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="hsl(189 100% 43%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"></path><path d="M9.6 4.6A2 2 0 1 1 11 8H2"></path><path d="M12.6 19.4A2 2 0 1 0 14 16H2"></path></svg>
                            <p>Control Climático</p>
                        </div>

                        {/*<div id={stylesWeather.tempContainer}>
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m8 4v10.54c1.57 0.91 2.33 2.75 1.86 4.5-0.46 1.75-2.05 2.96-3.86 2.96-1.81 0-3.4-1.21-3.86-2.96-0.47-1.75 0.29-3.59 1.86-4.5v-10.54c0-0.53 0.21-1.04 0.59-1.41 0.37-0.38 0.88-0.59 1.41-0.59 0.53 0 1.04 0.21 1.41 0.59 0.38 0.37 0.59 0.88 0.59 1.41z"/></svg>
                                <p>{!ESP32.state ? "--" :( ((ESP32.weather * 3.3)/4095)*100).toFixed(0)}°C</p>
                            </div>
                            <p>Temperatura Ambiente</p>
                            <div>El AC se encenderá cuando la temperatura sea mayor a 27°C</div>
                        </div>*/}

                        <div id={stylesWeather.controlSection}>
                            <div id={stylesWeather.airContainer}>
                                <div id={stylesWeather.airHead}>
                                    <div>
                                        <svg className={`${actuators.AC !== 0 ? stylesWeather.airOn : stylesWeather.airOff} ${styles.ESP32Disabled}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"></path><path d="M9.6 4.6A2 2 0 1 1 11 8H2"></path><path d="M12.6 19.4A2 2 0 1 0 14 16H2"></path></svg>
                                        <p>Aire Acondicionado</p>
                                    </div>
                                    <Switch className={ESP32.state === false || ESP32.weatherAutoMode ? styles.ESP32Disabled : undefined} checked={actuators.AC !== 0} onChange={() => handleToggleActuator("AC", (actuators.AC === 0 ? 127.5 : 0))}/>
                                </div>
                                
                                {actuators.AC !== 0 && (
                                    <div id={stylesWeather.airPowerContainer}>
                                        <div id={stylesWeather.airPowerHead}>
                                            <p>Potencia del Aire</p>
                                            <div>{(actuators.AC/255*100).toFixed(0)}%</div>
                                        </div>
                                        <input className={ESP32.state === false || ESP32.weatherAutoMode ? styles.ESP32Disabled : undefined} type="range" min={0} max={255} value={actuators.AC} onChange={(e) => handleToggleActuator("AC", Number(e.target.value))}/>
                                        <div id={stylesWeather.airPowerLevels}>
                                            <p>🍃 Suave</p><p>❄ Medio</p><p>☃️ Fuerte</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/*<div id={stylesWeather.autoContainer}>
                                <p>AUTO</p>
                                <Switch className={ESP32.state === false && styles.ESP32Disabled} checked={ESP32.weatherAutoMode} onChange={() => handleToggleESP32("weatherAutoMode", !ESP32.weatherAutoMode)}/>
                            </div>*/}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Domus;