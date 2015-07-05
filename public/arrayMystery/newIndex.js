/**
 * Created by mkmg on 5/11/15.
 */
(function() {
    "use strict";

    var step = 0;

    window.onload = function () {
        displayState();
        $("#next").on("click", next);
        $("#back").on("click", back);

        /*
        meredith - for debugging

        $("#promptwords").html(java_ast.find_by_id(1,mainAst).name);
        */
    };

    function next() {
        step++;
        displayState();
        // TO DO Add wraps
    }

    function back() {
        step--;
        displayState();
        // TO DO Add wraps
    }

    function displayState() {
        /*{ //state 1 (initial)
            array: [11, 14, 2, 4, 7],
            variables: {
                arrayLength: 5,
                i: "?"
            },
            promptText: "Let's label the indices of the array!",
            ast: mainAst,
            index: null,
            styleClasses: {
                mainColorText: [],
                mainColorBorder: [".indices"],
                accent1Highlight: [],
                accent1Border: [],
                accent2Hightlight: [],
                accent2Border: []
            }
         },*/
        var state = states[step];

        // Clears all of the html whose style can change with different states
        $(".clear").empty();

        // Reinsert the html of the problem text
        on_convert();

        // Rebuild the HTML of the array to ensure any styling is removed
        var elements = state.array;
        var array = $("#array");

        // Display Indices
        var tableHead = $("<thead>", {id: "indices"});
        if (state.index === null) {
            for (i = 0; i < state.array.length; i++) {
                var indexBox = $("<th><input type=\"text\" name=\"0\" maxlength=\"2\" id=\"index" + i + "\"></th>");
                tableHead.append(indexBox);
            }
        } else {
            for (i = 0; i < state.array.length; i++) {
                indexBox = $("<th id=\"index" + i + "\">" + i + "</th>");
                tableHead.append(indexBox);
            }
        }
        array.append(tableHead);

        var tableBody = $("<tbody>", {id: "arraydata"});
        for (var i = 0; i < elements.length; i++) {
            var child = $("<td id=\"ele" + i + "\"></td>");
            child.html(elements[i]);
            tableBody.append(child);
        }
        array.append(tableBody);


        // Update prompt text
        $("#promptwords").html(state.promptText);

        // Update Variables
        var variablelist = state.variables;
        var nameChild = $("<h1>", {class: "varlabel"});
        nameChild.html("arr:");
        $(".varlabelcolumn").append(nameChild);
        for (var key in variablelist) {
            insertVariable(key, variablelist[key]);
        }

        addStylingClasses(state);
    }

    /**
     * Add CSS styling classes to specified DOM elements
     * The styling information is stored in the state object
     * as an associative array of arrays. The name of the
     * CSS class to be applied is the key and its value
     * is an array of classes and ids of elements to which
     * the CSS class needs to be applied.
     */
    function addStylingClasses(state) {
        var classes = Object.keys(state.styleClasses);
        for (var i = 0; i < classes.length; i++) {
            var currClass = classes[i]; // Grabs the CSS class to be added to elements
            var applyTo = state.styleClasses[classes[i]]; // List of ids & classes of elements in DOM
            for (var j = 0; j < classes[i].length; j++) {
                $(applyTo[j]).addClass(currClass); // Adds CSS class to each element
            }
        }
    }

    function insertVariable(name, value) {
        // This function should insert the given variable into the dom
        var nameChild = $("<h1>", {class: "varlabel", id: name});
        nameChild.html(name + ":");
        $(".varlabelcolumn").append(nameChild);
        var varDiv = $("<div>", {class: "variable clear"});
        var varP = $("<p>", {class: "vardata digit", id: name + "div"});
        varP.html(value);
        varDiv.append(varP);
        $("#varvalues").append(varDiv);
    }

    /// string format function
    function sprintf(fmt) {
        var args = arguments;
        return fmt.replace(/{(\d+)}/g, function(match, index) {
            index = parseInt(index);
            return typeof args[index+1] !== 'undefined' ? args[index+1] : match;
        });
    }

    // returns a string representing indentation to given level.
    function indent(level) {
        return Array(4*level+1).join(" ");
    }

    /**
     *
     * @param node
     * @param indent_level
     * @param special_flag
     * @returns {*|jQuery|HTMLElement}
     */
    function to_dom(node, indent_level, special_flag) {
        // HACK special_flag is a boolean used to indicate things like "don't put a semi/newline on this statement"
        // or "don't put a newline before this if". It's very hacky.

        var elem = $('<span>');
        var firstIter;

        elem.attr('id', 'java-ast-' + node.id);

        switch (node.tag) {
            case 'method':
                elem.html(sprintf('public static void arrMys(', indent(0), node.name));
                firstIter = true;
                node.params.forEach(function(p) {
                    if (!firstIter) {
                        elem.append(", ");
                    }
                    firstIter = false;
                    elem.append(to_dom(p, 0));
                });
                elem.append(') {\n');
                node.body.forEach(function(s) {
                    elem.append(to_dom(s, 1));
                });
                elem.append(indent(0) + "}\n");
                break;

            case 'parameter':
                elem.addClass("parameter");
                elem.append(node.type + " " + node.name);
                break;

            case 'declaration':
                elem.addClass("declaration");
                if (!special_flag) {
                    elem.append(indent(indent_level));
                }
                elem.append(node.type + " ");
                elem.append(to_dom(node.expression, indent_level));
                if (!special_flag) {
                    elem.append(";\n");
                }
                break;

            case 'expression':
                elem.addClass("expression");
                // add some space if top-level (could replace this with something fancier)
                if (!special_flag) {
                    if (indent_level <= 2) { elem.append("\n"); }
                    elem.append(indent(indent_level));
                }
                var expression = to_dom(node.expression, indent_level);
                expression.addClass("whythisnotwork");
                var children = expression.children();
                console.log(expression.children());
                $(".expression span").addClass("expPart");
                //$(children[1]).addClass("expRight");
                elem.append(to_dom(node.expression, indent_level));
                if (!special_flag) {
                    elem.append(";\n");
                }
                break;

            case 'for':
                elem.addClass("for");
                elem.append(indent(indent_level) + 'for (');
                // statements inside of for loop header should not be indented/have newlines
                var init = $('<span>');
                init.attr('id', 'init');
                init.append(to_dom(node.initializer, indent_level, true));
                elem.append(init);
                elem.append('; ');
                var cond = $('<span>');
                cond.attr('id', 'test');
                cond.append(to_dom(node.condition, indent_level, true));
                elem.append(cond);
                elem.append('; ');
                var update = $('<span>');
                update.attr('id', 'update');
                update.append(to_dom(node.increment, indent_level, true));
                elem.append(update);
                elem.append(') {');
                var count = 0;
                var colors = ['pink', 'purple', 'orange'];
                node.body.forEach(function(s) {
                    // Megan's experiment stuff
                    var line = to_dom(s, indent_level+ 1);
                    //line.css('color', colors[count]);
                    line.addClass("forBlock" + count);
                    count++;
                    elem.append(line);
                    //elem.append(to_dom(s, indent_level+ 1));
                });
                elem.append(indent(indent_level) + '}\n');
                break;

            case 'if':
                elem.addClass("if");
                if (!special_flag) {
                    // leave a blank line between ifs (could replace with something fancier like boxes)
                    elem.append("\n" + indent(indent_level));
                }
                elem.append("if (");
                var test = to_dom(node.condition, indent_level);
                test.addClass("iftest");
                elem.append(test);
                //elem.append(to_dom(node.condition, indent_level));
                elem.append(") {\n");
                var count = 0;
                node.then_branch.forEach(function(s) {
                    var line = to_dom(s, indent_level + 1);
                    line.addClass("ifBlock" + count);
                    elem.append(line);
                    count++;
                    //elem.append(to_dom(s, indent_level + 1));
                });
                if (node.else_branch) {
                    elem.append(indent(indent_level) + '} else ');
                    // check if the else branch is another if/else, if so, skip brackets/newlines
                    if (node.else_branch.tag === 'if') {
                        elem.append(to_dom(node.else_branch, indent_level, true));
                    } else {
                        elem.append('{\n');
                        //var count = 0;
                        node.else_branch.forEach(function(s) {
                            //var line = to_dom(s, indent_level + 1);
                            //line.addClass("ifBlock" + count);
                            //count++;
                            elem.append(to_dom(s, indent_level + 1));
                        });
                    }
                }
                if (!special_flag) {
                    elem.append(indent(indent_level) + "}\n");
                }
                break;

            case 'binop':
                elem.append(to_dom(node.args[0], indent_level));
                elem.append(" " + node.operator + " ");
                elem.append(to_dom(node.args[1], indent_level));
                break;

            case 'postfix':
                elem.addClass("postfix");
                elem.append(to_dom(node.args[0], indent_level));
                elem.append(node.operator);
                break;

            case 'call':
                elem.addClass("call");
                elem.append(to_dom(node.object, indent_level));
                elem.append('(');
                // HACK this totally assumes function calls have only one argument,
                // which happens to be true for array and if/else mysteries.
                elem.append(to_dom(node.args[0], indent_level));
                elem.append(')');
                break;

            case 'index':
                elem.addClass("index");
                elem.append(to_dom(node.object, indent_level));
                elem.append('[');
                elem.append(to_dom(node.index, indent_level));
                elem.append(']');
                break;

            case 'reference':
                elem.addClass("reference");
                elem.append(to_dom(node.object, indent_level));
                elem.append('.' + node.name);
                break;

            case 'identifier':
                elem.addClass("identifier");
                elem.text(node.value);
                break;

            case 'literal':
                elem.addClass("literal");
                elem.text(typeof node.value === 'number' ? node.value : '"' + node.value + '"');
                break;

            default:
                throw new Error("unknown ast tag " + node.tag);
                break;
        }
        return elem;
    }

    function set_class_of_ast_dom_element(id, clazz) {
        $('#java-ast-' + id).addClass(clazz);
    }

    function on_convert() {
        var dom = to_dom(mainAst, 0);
        $('#problemtext').html('').append(dom[0]);
    }

    function on_show() {
        var ast = java_parsing.browser_parse($('#code').val());
        var node = java_ast.find_by_id(parseInt($('#toshow').val()), ast);
        $('#node').html(node.tag);
    }


})();