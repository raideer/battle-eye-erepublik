class CountryStats{
    constructor(){
        this.countries = {};
    }

    handle(data){
        var country = data.msg.permalink;
        if(!this.countries[country]){
            this.countries[country] = {
                damage: 0,
                kills: 0
            }
        }

        this.countries[country].damage += data.msg.damage;
        this.countries[country].kills ++;
    }

    handleBare(data){
        var ob = {
            msg: {
                permalink: "",
                damage: 0
            }
        };

        ob.msg.damage = data.damage;
        ob.msg.permalink = data.permalink;

        this.handle(ob);
    }

    getAll(){
        var self = this;
        var sorted = {};

        var keysSorted = Object.keys(self.countries).sort(function(a,b) {
            return self.countries[b].damage - self.countries[a].damage;
        });

        for(var i in keysSorted){
            var key = keysSorted[i];
            sorted[key] = self.countries[key];
        }
        return sorted;
    }
}
