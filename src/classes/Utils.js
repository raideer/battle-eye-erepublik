class Utils
{
    uid() {
        return ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-4);
    }

    prettifyCountryName(country) {
        var prettyName = country;
        if (prettyName === "Republic-of-Macedonia-FYROM") {
            prettyName = "Republic-of-Macedonia";
        }

        prettyName = prettyName.replace(/\-/g, ' ');

        return prettyName;
    }
}

export default (new Utils());
