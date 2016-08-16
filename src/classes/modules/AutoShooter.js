class AutoShooter extends Module{
    constructor(){
        super('AutoShooter', 'Automatically shoots, when the FIGHT button is held');
    }

    defineSettings(){
        return [
            ['autoShooterEnabled', false, "Enable AutoShooter", "Automatically shoots, when the FIGHT button is held"],
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
                    console.log("Request sent. Received: " + data.message);
    				if(data.message == "ENEMY_KILLED"){

                        $j("#rank_min").text(format(data.rank.points) + " Rank Points");
    					$j("#rank_status_gained").css("width", data.rank.percentage + "%");
    					window.totalPrestigePoints += data.hits;
    					$j("#prestige_value").text(format(window.totalPrestigePoints));
    					$j("#side_bar_currency_account_value").text(format(data.details.currency));
    					$j(".left_player .energy_progress").css("width", data.details.current_energy_ratio + "%");
    					$j(".right_player .energy_progress").css("width", data.enemy.energyRatio + "%");
    					$j(".weapon_no").text(data.user.weaponQuantity);
    					globalNS.updateSideBar(data.details);

    				}else if(data.message == "ENEMY_ATTACKED" || data.message == "LOW_HEALTH"){
    					// alert("Low health. AutoShooter stopped");
    					if (tid) clearInterval(tid);
    				}else if(data.message == "ZONE_INACTIVE"){
    					// alert("Zone is inactive. AutoShooter stopped");
    					if (tid) clearInterval(tid);
    				}
                });
            }

    		// action();
    		tid=setInterval(action, Number(settings.autoShooterDelay.value));
    		console.log("AutoShooter started");
    	});

    	document.addEventListener("mouseup", function(){
    		if (tid) clearInterval(tid);
    	});

    	// alert("Auto shooter is ready");
    }
}
