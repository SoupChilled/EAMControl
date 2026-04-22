import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import styles from '../styles/boards/boards.module.css'

const Home = () => {
    useEffect(() => {
        document.title = "Boards | EAMControl";
    }, []);

    const navigate = useNavigate();

    return(
        <div id={styles.MainContainer}>
            <div id={styles.head}>
                <p>EAMControl</p>
                <p>Selecciona una board y explora proyectos.</p>
            </div>

            <div id={styles.cards}>
                <div id={styles.card} className={styles.esp32Card}>
                    <div id={styles.image} className={styles.esp32Image}>
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h.01"></path><path d="M2 8.82a15 15 0 0 1 20 0"></path><path d="M5 12.859a10 10 0 0 1 14 0"></path><path d="M8.5 16.429a5 5 0 0 1 7 0"></path></svg>
                        </div>
                        <img src="/images/esp32.svg"/>
                    </div>

                    <div id={styles.cardInfo} className={styles.esp32CardInfo}>
                        <p>ESP32</p>
                        <p>Microcontrolador con WiFi y Bluetooth<br/>integrado, ideal para proyectos IoT</p>
                    </div>

                    <div id={styles.features} className={styles.esp32Features}>
                        <div>WiFi</div> <div>Bluetooth</div> <div>Dual Core</div> <div>32-Bit</div>
                    </div>

                    <button id={styles.goBoard} className={styles.esp32GoBoard} onClick={() => navigate("/esp32")}>
                        Ver Proyectos
                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                    </button>
                </div>

                <div id={styles.card} className={styles.arduinoCard}>
                    <div id={styles.image} className={styles.arduinoImage}>
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"></rect><rect width="6" height="6" x="9" y="9" rx="1"></rect><path d="M15 2v2"></path><path d="M15 20v2"></path><path d="M2 15h2"></path><path d="M2 9h2"></path><path d="M20 15h2"></path><path d="M20 9h2"></path><path d="M9 2v2"></path><path d="M9 20v2"></path></svg>
                        </div>
                        <img src="/images/arduino-uno.svg"/>
                    </div>

                    <div id={styles.cardInfo} className={styles.arduinoCardInfo}>
                        <p>ARDUINO</p>
                        <p>Plataforma de desarrollo versátil y fácil<br/>de usar para principiantes</p>
                    </div>

                    <div id={styles.features} className={styles.arduinoFeatures}>
                        <div>1 núcleo</div> <div>Fácil uso</div> <div>2KB RAM</div> <div>8-Bit</div>
                    </div>

                    <button id={styles.goBoard} className={styles.arduinoGoBoard} onClick={() => navigate("/arduino")}>
                        Ver Proyectos
                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                    </button>
                </div>

                <div id={styles.card} className={styles.microbitCard}>
                    <div id={styles.image} className={styles.microbitImage}>
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>
                        </div>
                        <img src="/images/microbit.svg"/>
                    </div>

                    <div id={styles.cardInfo} className={styles.microbitCardInfo}>
                        <p>Micro:Bit</p>
                        <p>Microcontrolador educativo con sensores<br/>integrados y programación visual</p>
                    </div>

                    <div id={styles.features} className={styles.microbitFeatures}>
                        <div>Educativo</div> <div>Sensores</div> <div>Bluetooth</div> <div>32-Bit</div>
                    </div>

                    <button id={styles.goBoard} className={styles.microbitGoBoard} onClick={() => navigate("/microbit")}>
                        Ver Proyectos
                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;