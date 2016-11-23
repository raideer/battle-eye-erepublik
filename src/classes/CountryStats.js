export default class CountryStats{
    constructor(){
        this.countries = {};
    }

    handle(data, addKill = true, addDamage = true){
        var country = data.msg.permalink;
        if(!this.countries[country]){
            this.countries[country] = {
                damage: 0,
                kills: 0
            }
        }

        if(addDamage){
            this.countries[country].damage += data.msg.damage;
        }

        if(addKill){
            this.countries[country].kills += 1;
        }
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

        this.handle(ob, false);
    }

    handleKills(country, value){
        if(!this.countries[country]){
            this.countries[country] = {
                damage: 0,
                kills: 0
            }
        }

        this.countries[country].kills += value;
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
