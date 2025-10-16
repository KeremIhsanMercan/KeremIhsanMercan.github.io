
var placed_numbers = 0;
var invalid_places = 0;
var game_difficulty;
var max_number;
var button_count;

var pop = new Audio("sound_effects/pop.mp3");
var win = new Audio("sound_effects/win.mp3");
var lose = new Audio("sound_effects/lose.mp3");
var invalid = new Audio("sound_effects/invalid.mp3");
var dice = new Audio("sound_effects/dice.mp3");
var erase = new Audio("sound_effects/erase.mp3");
var reset = new Audio("sound_effects/reset.mp3");
var cancel = new Audio("sound_effects/cancel.mp3");

function play_sound(input) {

    input.load();
    input.play();

}

night_mode_adjuster();

function start(difficulty) {
    play_sound(reset);
    game_difficulty = difficulty;
    max_number = Math.pow(10, game_difficulty);
    button_count = Math.floor(5 * Math.pow(2, game_difficulty-1));
    init();
    show(jokers[0]);
    roll_a_number();    
}

let jokers = [document.getElementById("joker_activator1"), document.getElementById("joker_activator2"), document.getElementById("joker_activator3")];
let joker1_used = false;
let joker2_used = false;
let joker3_used = false;

var is_game_over = false;

let init = ()=>{
    var ol_element = document.getElementsByTagName("ol")[0];
    for(var i = 0; i<button_count; i++){
        let new_element = document.createElement("li");
        ol_element.appendChild(new_element);
        new_element.classList.add("num_list_item");
        new_element.innerHTML += '<b>'+(i+1)+" ."+'</b>';
        new_element.innerHTML += '<button class="tik_button" onclick="place_number(this)">Place Here</button>';
        new_element.innerHTML += '<p data-statu="empty" data-order="'+(i+1)+'" ></p>';
        new_element.innerHTML += '<button class="joker_button" onclick="joker_button(this)">Placeholder</button>';
    }
    document.getElementById("progress_bar_div").innerHTML = "<progress id='progress_bar' value='0' max='"+button_count+"'></progress>"
}


function place_number(thisone) {

    let rolled_number = document.getElementById("random_number_displayer").innerHTML;
    
    if (rolled_number == "" || rolled_number == null) {
        return;
    }

    let p_element = thisone.parentElement.querySelector("[data-order]"); 
    let p_element_order = p_element.dataset.order;
    p_element_order = p_element_order*1;

    if (    validity_checker_up(p_element_order, rolled_number, 1)
         && validity_checker_down(p_element_order, rolled_number, 1)
        ) {
        p_element.innerHTML = rolled_number;
        hide(thisone);
        p_element.dataset.statu = "placed";
        placed_numbers += 1;
        document.getElementById("progress_bar").value += 1;
        play_sound(pop);
        roll_a_number();
    }

    if (placed_numbers == 3 && !joker2_used) {
        show(jokers[1]);
    }

    if (placed_numbers == 1 && !joker3_used) {
        show(jokers[2]);
    }
    
    
    
    return;
}


var show = (element) => element.style.display = "inline-block";
var hide = (element) => element.style.display = "none";

function roll_a_number() {
    invalid_places = 0;
    let rolled_number = Math.floor(Math.random() * max_number) + 1;
    document.getElementById("random_number_displayer").innerHTML = rolled_number;
    document.getElementById("start_button1").style.visibility = "hidden";
    document.getElementById("start_button2").style.visibility = "hidden";
    document.getElementById("start_button3").style.visibility = "hidden";


    lose_checker(rolled_number);
}

function lose_checker(rolled_number) {

    if (is_game_over) {
        
        return;
    }

    invalid_places = 0;
    for (let index = 1; index <= button_count; index++) {
        
        if (document.querySelector("[data-order='"+index+"']").innerHTML == "") {
            if (!(validity_checker_up(index, rolled_number, 0) && validity_checker_down(index, rolled_number, 0))) {
                invalid_places += 1;
            }
            
        }
    }

    if (placed_numbers == button_count) {
        document.getElementById("random_number_displayer").innerHTML = "";
        is_game_over = true;
        setTimeout(() => {
            game_win_screen();
        }, 300);
        
    } else {
        if (joker1_used && (joker2_used || placed_numbers < 3) && joker3_used) {
            if (invalid_places + placed_numbers == button_count) {
                is_game_over = true;
                setTimeout(() => {
                    game_over_screen();
                }, 300);
            }
        }
    }
}

function validity_checker_up(order, rolled_number, invalid_alert_checker) {

    if (order == button_count) {
        return true;
    }

    if (document.querySelector("[data-order='"+(order + 1)+"']").innerHTML == "" || document.querySelector("[data-order='"+(order + 1)+"']").innerHTML == undefined) {
        
        if (order < button_count) {
            if (validity_checker_up(order+1, rolled_number, invalid_alert_checker)) {
                return true;
            }
        }

        return false;

    } else if ((document.querySelector("[data-order='"+(order + 1)+"']").innerHTML)*1 < rolled_number) {
        if (invalid_alert_checker == 1) {
            invalid_alert();
        }
        return false; 
    }

    return true;
}

function validity_checker_down(order, rolled_number, invalid_alert_checker) {

    if (order == 1) {
        return true;
    }

    if (document.querySelector("[data-order='"+(order - 1)+"']").innerHTML == "" || document.querySelector("[data-order='"+(order - 1)+"']").innerHTML == undefined) {
        
        if (order > 1) {
            if (validity_checker_down(order-1, rolled_number, invalid_alert_checker)) {
                return true;
            }
        }

        return false;

    } else if ((document.querySelector("[data-order='"+(order - 1)+"']").innerHTML)*1 > rolled_number) {
        if (invalid_alert_checker == 1) {
            invalid_alert();
        }
        return false; 
    }

    return true;
}

function invalid_alert() {
    invalid.play();
    setTimeout(() => {
        Swal.fire(
            'Opps',
            'Invalid Placement Attempt!',
            'warning'
          );
    }, 50);
}

function game_over_screen() {

    lose.play();
    setTimeout(() => {
        Swal.fire(
            'Game Over',
            'Your score is ' + placed_numbers + '.',
            'error'
        );
    }, 50);
}

function game_win_screen() {
    
    win.play();
    hide(jokers[0]);
    hide(jokers[1]);
    hide(jokers[2]);
    setTimeout(() => {
        Swal.fire(
            'Congragulations!',
            "YOU WIN",
            'success'
        );
    }, 50);
}

function joker_activator_mouse_on(type) {

    let explainer = document.getElementById("joker_explainer");

    if (type == 1) {
        explainer.innerHTML = "Rerolls the current number.";
    } else if (type == 2) {
        explainer.innerHTML = "Erases 3 numbers randomly.";
    } else if (type == 3) {
        explainer.innerHTML = "Lets you to erase a number.";
    }

}

function start_mouse_on(type) {

    let explainer = document.getElementById("joker_explainer");

    if (type == 1) {
        explainer.innerHTML = "5 tiles | 1-10";
    } else if (type == 2) {
        explainer.innerHTML = "10 tiles | 1-100";
    } else if (type == 3) {
        explainer.innerHTML = "20 tiles | 1-1000";
    }

}

function mouse_off() {

    let explainer = document.getElementById("joker_explainer");

    explainer.innerHTML = "";
}

function joker_activator_onclick1(thisone) {
    hide(thisone);
    joker1_used = true;
    play_sound(dice);
    roll_a_number();
}

function joker_activator_onclick2(thisone) {
    
    let joker2_rand_arr = [];
    joker2_rand_arr.length = 3;
    let i = 0;

    do {
        
        let x = Math.floor(Math.random() * (button_count)) + 1;
        if (joker2_rand_arr.includes(x) || document.querySelector("[data-order='"+x+"']").innerHTML == "") {
            continue;
        }

        joker2_rand_arr[i] = x;
        i++;

    } while (joker2_rand_arr.includes(null) || joker2_rand_arr.includes(undefined));

    for (let index = 0; index < joker2_rand_arr.length; index++) {
        
        let p_element = document.querySelector("[data-order='"+joker2_rand_arr[index]+"']");
        let p_element_placement_button = p_element.parentElement.querySelector("button.tik_button");

        p_element.innerHTML = "";
        placed_numbers -= 1;
        document.getElementById("progress_bar").value -= 1;
        play_sound(erase);
        p_element.dataset.statu = "empty";
        show(p_element_placement_button);

    }

    hide(thisone);

    if (placed_numbers == 0) {
        hide(jokers[2]);
    }

    joker2_used = true;
    lose_checker(document.getElementById("random_number_displayer").innerHTML);
}

function joker_activator_onclick3(thisone) {

    let placed_tiles = document.querySelectorAll("[data-statu='placed']");

    for (let index = 0; index < placed_tiles.length; index++) {
        
        let joker_button = placed_tiles[index].parentElement.querySelector("button.joker_button");
        joker_button.innerHTML = "Erase This";
        show(joker_button);
        joker_button.dataset.statu = "visible";
        
    }

    document.getElementById("joker_canceler").style.visibility = "visible";
    document.getElementById("joker_activator3").dataset.saved_rolled_number = document.getElementById("random_number_displayer").innerHTML;

    document.getElementById("random_number_displayer").innerHTML = "";
    document.getElementById("random_number_displayer").style.backgroundImage = "url(images/eraser.jpg)";
    hide(jokers[0]);
    hide(jokers[1]);


    show(thisone);
}

function joker_button(thisone) {
    
    let p_element = thisone.parentElement.querySelector("[data-order]");;
    let p_element_placement_button = p_element.parentElement.querySelector("button.tik_button");;
    
    if (thisone.innerHTML == "Erase This") {
        hide(jokers[2]);
        p_element.innerHTML = "";
        placed_numbers -= 1;
        document.getElementById("progress_bar").value -= 1;
        play_sound(erase);
        p_element.dataset.statu = "empty";
        show(p_element_placement_button);
        joker3_used = true;
        document.getElementById("joker_canceler").style.visibility = "hidden";
    }
    
    let opened_joker_buttons = document.querySelectorAll(".joker_button[data-statu='visible']");

    for (let index = 0; index < opened_joker_buttons.length; index++) {
        hide(opened_joker_buttons[index]);
        opened_joker_buttons[index].dataset.statu = "hidden";
    }

    if (!joker2_used && placed_numbers >= 3) {
        show(jokers[1]);
    }

    if (!joker1_used) {
        show(jokers[0]);
        
    }

    document.getElementById("random_number_displayer").innerHTML = document.getElementById("joker_activator3").dataset.saved_rolled_number;
    document.getElementById("random_number_displayer").style.backgroundImage = "";
    


    lose_checker(document.getElementById("random_number_displayer").innerHTML);
    
}

function cancel_func() {

    let placed_tiles = document.querySelectorAll("[data-statu='placed']");

    for (let index = 0; index < placed_tiles.length; index++) {
        
        let joker_button = placed_tiles[index].parentElement.querySelector("button.joker_button");
        joker_button.innerHTML = "Erase This";
        hide(joker_button);
        joker_button.dataset.statu = "hidden";
        
    }
    document.getElementById("joker_canceler").style.visibility = "hidden";
    play_sound(cancel);

    document.getElementById("random_number_displayer").innerHTML = document.getElementById("joker_activator3").dataset.saved_rolled_number;
    document.getElementById("random_number_displayer").style.backgroundImage = "";

    if (!joker2_used && placed_numbers >= 3) {
        show(jokers[1]);
    }

    if (!joker1_used) {
        show(jokers[0]);
        
    }

}

function night_mode_activator(thisone) {

    play_sound(pop);

    if (localStorage.getItem("dark_mode") == "dark") {
        thisone.style.backgroundImage = "url(images/moon.jpg)";
    
    
        document.body.style.backgroundColor = "white";
        let divs = document.getElementsByTagName("div");
        
        for (let index = 0; index < divs.length; index++) {
            
            divs[index].style.color = "black";
            divs[index].style.border = "3px solid black";
            
        }
        document.getElementById("random_number_displayer").style.border = "3px solid black";
        document.getElementById("list_div").style.border = "none";
        document.getElementById("progress_bar_div").style.border = "none";
        localStorage.setItem("dark_mode", "light");

    } else {
        thisone.style.backgroundImage = "url(images/sun.jpg)";
    
    
        document.body.style.backgroundColor = "black";
        let divs = document.getElementsByTagName("div");
        
        for (let index = 0; index < divs.length; index++) {
            
            divs[index].style.color = "white";
            divs[index].style.border = "3px solid white";
            
        }
        document.getElementById("random_number_displayer").style.border = "3px solid white";
        document.getElementById("list_div").style.border = "none";
        document.getElementById("progress_bar_div").style.border = "none";
        localStorage.setItem("dark_mode", "dark");
    }
}

function night_mode_adjuster() {

    let thisone = document.getElementById("night_mode");

    if (localStorage.getItem("dark_mode") == "dark") {
        
        thisone.style.backgroundImage = "url(images/sun.jpg)";
    
    
        document.body.style.backgroundColor = "black";
        let divs = document.getElementsByTagName("div");
        
        for (let index = 0; index < divs.length; index++) {
            
            divs[index].style.color = "white";
            divs[index].style.border = "3px solid white";
            
        }
        document.getElementById("random_number_displayer").style.border = "3px solid white";
        document.getElementById("list_div").style.border = "none";
        document.getElementById("progress_bar_div").style.border = "none";
        localStorage.setItem("dark_mode", "dark");

    } else {
        thisone.style.backgroundImage = "url(images/moon.jpg)";
    
    
        document.body.style.backgroundColor = "white";
        let divs = document.getElementsByTagName("div");
        
        for (let index = 0; index < divs.length; index++) {
            
            divs[index].style.color = "black";
            divs[index].style.border = "3px solid black";
            
        }
        document.getElementById("random_number_displayer").style.border = "3px solid black";
        document.getElementById("list_div").style.border = "none";
        document.getElementById("progress_bar_div").style.border = "none";
        localStorage.setItem("dark_mode", "light");
    }
}