import {Controller} from "stimulus"

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
        let closeTheSidebar = localStorage.getItem('sidebarIsOpen') === 'true';

        toggleSidebar(!closeTheSidebar)

        sidebarToggle.onclick = ((event) => {
            event.preventDefault();
            let closeTheSidebar = localStorage.getItem('sidebarIsOpen') === 'true';
            toggleSidebar(closeTheSidebar);
            // TODO save in session and open/close sidebar it when rendering the page
            localStorage.setItem('sidebarIsOpen', !closeTheSidebar);
        })
    }
}
