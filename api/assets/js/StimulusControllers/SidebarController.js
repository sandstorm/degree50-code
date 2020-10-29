import {Controller} from "stimulus"

function setCookie(cname, cvalue) {
    const d = new Date();
    document.cookie = cname + "=" + cvalue;
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

export default class extends Controller {
    connect() {
        const toggleSidebar = (closeSidebar) => {
            if(closeSidebar) {
                sidebar.classList.add('sidebar--is-closed');
            } else {
                sidebar.classList.remove('sidebar--is-closed');
            }
        }

        const sidebar = this.data.element;
        const sidebarToggle = document.getElementById('sidebar-toggle');

        sidebarToggle.onclick = ((event) => {
            event.preventDefault();
            const sidebarIsOpen = getCookie('sidebarIsOpen') !== 'false';
            toggleSidebar(sidebarIsOpen);
            setCookie('sidebarIsOpen', !sidebarIsOpen)
        })
    }
}
