import './style.module.css'

function New() {
    return (
        <>
            <div>
                <img src='https://1000logos.net/wp-content/uploads/2021/05/Google-logo.png' alt="" />
                <input type="text" />
                <button style={{ position: 'absolute', top: "55%", left: '40%', height: "40px", width: '10%' }}>Google Search</button>
                <button style={{ position: 'absolute', top: "55%", left: '50%', height: "40px", width: '10%' }}>I'm Feeling Lucky</button>
                <h4 style={{ position: 'absolute', top: '62%', left: '42%', }}>Google.ca offered in: <a href="" style={{ textDecoration: 'none' }}>Francais</a></h4>
            </div>
        </>
    );
}

export default New;