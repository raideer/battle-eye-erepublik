class AutoShooter extends Module{
    constructor(){
        super('AutoShooter', 'Automatically shoots, when the FIGHT button is held');
    }

    /**
     * Defining settings for autoshooter
     */
    defineSettings(){
        return [
            ['autoShooterEnabled', false, "Enable AutoShooter", "Automatically shoots, when the FIGHT button is held"],
            ['autoShooterStart', false, "Start AutoShooter immediately after the button is pressed.", "Otherwise, AutoShooter will start after the shot delay"],
            ['autoShooterEnter', true, "Shoot while holding ENTER"],
            ['autoShooterSpace', true, "Shoot while holding SPACE"],
            ['autoShooterDelay', 1500, "Delay between shots (in ms)"]
        ];
    }

    run(){
        /**
         * Holds the timer interval data
         */
        var tid;

        var lastEvent;

        /**
         * eRepublik number format
         */
    	function format(str){
    		return ("" + str).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    	}

        /**
         * Button click handler
         */
        document.getElementById("fight_btn").addEventListener("mousedown", function(){
            handle();
        });

        /**
         * Key press handler
         */
        document.onkeydown = function(e) {
            if (lastEvent && lastEvent.keyCode == e.keyCode) {
                return;
            }

            if(((settings.autoShooterEnter.value && e.keyCode == 13) || (settings.autoShooterSpace.value && e.keyCode == 32)) && settings.autoShooterEnabled.value){
                lastEvent = e;
                handle();
                $j('#fight_btn').notify('AutoShooter started', {position: "top center", className: "info"});
            }
        };

        /**
         * Clears the delay, when the button is released
         */
    	document.addEventListener("mouseup", function(){
    		clearInterval(tid);
    	});

        /**
         * Clears the delay, when the key is released
         */
        document.onkeyup = function(e) {
            if((settings.autoShooterEnter.value && e.keyCode == 13) || (settings.autoShooterSpace.value && e.keyCode == 32)){
                lastEvent = null;
                clearInterval(tid);
            }
        }

        /**
         * AutoShooter handler
         */
        var handle = function(){
            //Checking if enabled
            if(!settings.autoShooterEnabled.value){
                return;
            }

            //Posts fight request
    		var action = function(){
                $j.post("/" + erepublik.settings.culture + "/military/fight-shoo" + (SERVER_DATA.onAirforceBattlefield ? "oo" : "o") + "t/" + SERVER_DATA.battleId, {
                    sideId: SERVER_DATA.countryId,
                    battleId: SERVER_DATA.battleId,
                    _token: SERVER_DATA.csrfToken
                }, function(data){
                    if(settings.enableLogging.value){
                        console.log("[BATTLEEYE] Request sent. Received: " + data.message);
                    }

    				if(data.message == "ENEMY_KILLED"){
                        window.totalPrestigePoints += data.hits;
                        globalNS.updateSideBar(data.details);
                        $j("#rank_min").text(format(data.rank.points) + " Rank Points");
                        $j("#rank_status_gained").css("width", data.rank.percentage + "%");

                        $j("#prestige_value").text(format(window.totalPrestigePoints));
                        $j("#side_bar_currency_account_value").text(format(data.details.currency));
                        $j(".left_player .energy_progress").css("width", data.details.current_energy_ratio + "%");
                        $j(".right_player .energy_progress").css("width", data.enemy.energyRatio + "%");
                        $j(".weapon_no").text(data.user.weaponQuantity);

                        if($j('#eRS_options').length <= 0){
                            var td = parseInt($j('#total_damage strong').text().replace(/,/g, ''));
                            $j('#total_damage strong').text(format(td + data.user.givenDamage));
                        }
    				}else if(data.message == "ENEMY_ATTACKED" || data.message == "LOW_HEALTH"){
                        $j('#fight_btn').notify('Low health. AutoShooter stopped', {position: "top center", className: "info"});
    					if (tid) clearInterval(tid);
    				}else if(data.message == "ZONE_INACTIVE"){
                        $j('#fight_btn').notify('Zone is inactive. AutoShooter stopped', {position: "top center", className: "info"});
    					if (tid) clearInterval(tid);
                    }else if(data.message == "SHOOT_LOCKOUT"){
                        $j('#fight_btn').notify('Shoot lockout (Shooting too fast?). AutoShooter stopped.', {position: "top center", className: "info"});
    					if (tid) clearInterval(tid);
    				}else{
                        $j('#fight_btn').notify('AutoShooter stopped. Received: "'+data.message+'"', {position: "top center", className: "warn"});
    					if (tid) clearInterval(tid);
                    }
                });
            }

            if(settings.autoShooterStart.value){
                action();
            }
    		tid=setInterval(action, Number(settings.autoShooterDelay.value));

            if(settings.enableLogging.value){
                console.log("[BATTLEEYE] AutoShooter started");
            }
    	}
    }
}
