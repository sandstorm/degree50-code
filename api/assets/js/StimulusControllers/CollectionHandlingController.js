import { Controller } from "stimulus"
import $ from 'jquery';

export default class extends Controller {
    connect() {
        let $collectionHolder;

        // setup an "add a tag" link
        const $addTagButton = $('<button type="button" class="btn btn-primary btn-sm add_tag_link">Material hinzufügen</button>');
        const $newLinkLi = $('<div></div>').append($addTagButton);

        $(document).ready(function() {
            // Get the ul that holds the collection of tags
            $collectionHolder = $('#video_analysis_material');

            // add the "add a tag" anchor and li to the tags ul
            $collectionHolder.append($newLinkLi);

            // count the current form inputs we have (e.g. 2), use that as the new
            // index when inserting a new item (e.g. 2)
            $collectionHolder.data('index', $collectionHolder.find('.vich-file').length);

            $addTagButton.on('click', function(e) {
                // add a new tag form (see next code block)
                addTagForm($collectionHolder, $newLinkLi);
            });

            // file / label handling for bootstrap styled forms
            $('.vich-file input[type="file"]').change( function() {
                let filename = $(this)[0].value;
                const idx = filename.lastIndexOf("\\");
                filename = filename.substr(idx+1);
                $(this).next('label').html(filename);
            });
        });
    }
}

function addTagForm($collectionHolder, $newLinkLi) {
    // Get the data-prototype explained earlier
    const prototype = $collectionHolder.data('prototype');

    // get the new index
    const index = $collectionHolder.data('index');

    let newForm = prototype;
    newForm = newForm.replace(/__name__label__/g, '');

    // increase the index with one for the next item
    $collectionHolder.data('index', index + 1);

    // Display the form in the page in an li, before the "Add a tag" link li
    var $newFormLi = $('<fieldset class="form-group"></fieldset>').append(newForm);
    $newLinkLi.before($newFormLi);
}