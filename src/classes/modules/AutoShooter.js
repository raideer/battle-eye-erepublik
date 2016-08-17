class AutoShooter extends Module{
    constructor(){
        super('AutoShooter', 'Automatically shoots, when the FIGHT button is held');
    }

    defineSettings(){
        return [
            ['autoShooterEnabled', false, "Enable AutoShooter", "Automatically shoots, when the FIGHT button is held"],
            ['autoShooterStart', false, "Start AutoShooter immediately after the button is pressed.", "Otherwise, AutoShooter will start after the shot delay"],
            ['autoShooterDelay', 1500, "Delay between shots (in ms)"]
        ];
    }

    run(){
        var tid;

    	function format(str){
    		return ("" + str).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    	}

    	document.getElementById("fight_btn").addEventListener("mousedown", function(){
            if(!settings.autoShooterEnabled.value){
                return;
            }
    		var action = function(){
                $j.post("/" + erepublik.settings.culture + "/military/fight-shoo" + (SERVER_DATA.onAirforceBattlefield ? "oo" : "o") + "t/" + SERVER_DATA.battleId, {
                    sideId: SERVER_DATA.countryId,
                    battleId: SERVER_DATA.battleId,
                    _token: SERVER_DATA.csrfToken
                }, function(data){
                    if(settings.enableLogging.value){
                        console.log("Request sent. Received: " + data.message);
                    }

    				if(data.message == "ENEMY_KILLED"){

                        console.log(data);
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
                            var td = parseFloat($j('#total_damage strong').text().replace(',', ''));
                            console.log(td);
                            // $j('#total_damage strong').text(format(td + data.user.givenDamage));
                        }


    				}else if(data.message == "ENEMY_ATTACKED" || data.message == "LOW_HEALTH"){
                        $j('#fight_btn').notify('Low health. AutoShooter stopped', {position: "top center", className: "info"});
    					if (tid) clearInterval(tid);
    				}else if(data.message == "ZONE_INACTIVE"){
                        $j('#fight_btn').notify('Zone is inactive. AutoShooter stopped', {position: "top center", className: "info"});
    					if (tid) clearInterval(tid);
    				}
                });
            }

            if(settings.autoShooterStart.value){
                action();
            }
    		tid=setInterval(action, Number(settings.autoShooterDelay.value));
    		console.log("AutoShooter started");
    	});

    	document.addEventListener("mouseup", function(){
    		if (tid) clearInterval(tid);
    	});

    	// alert("Auto shooter is ready");
    }
}
