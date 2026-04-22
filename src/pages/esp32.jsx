import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import styles from '../styles/esp32/esp32.module.css'

const ESP32 = () => {
    useEffect(() => {
        document.title = "ESP32 | EAMControl";
    }, []);

    const navigate = useNavigate();

    return(
        <div id={styles.MainContainer}>
            <div id={styles.head}>
                <img src="/images/esp32.svg"/>
                <p>Proyectos ESP32</p>
            </div>

            <div id={styles.cards}>
                <div id={styles.card} className={styles.houseCard}>
                    <div id={styles.image} className={styles.houseImage}>
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                        </div>
                        <img src="/images/house.png"/>
                    </div>

                    <div id={styles.cardInfo} className={styles.houseCardInfo}>
                        <p>Control de Casa Inteligente</p>
                        <p>Sistema completo para automatizar luces,<br/>temperatura y seguridad de tu hogar</p>
                    </div>

                    <div id={styles.features} className={styles.houseFeatures}>
                        <div>Control de luces</div> <div>Sensores</div> <div>Seguridad</div> <div>Piscina</div>
                    </div>

                    <button id={styles.goProject} className={styles.houseGoProject} onClick={() => navigate("/esp32/domus")}>
                        USAR
                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ESP32;