import styles from './switch.module.css';

const Switch = ({className, checked, onChange}) => {
    return(
        <label className={`${styles.switch} ${className}`}>
            <input type="checkbox" checked={checked} onChange={onChange}/>
            <span className={styles.slider}></span>
        </label>
    );
};

export default Switch;