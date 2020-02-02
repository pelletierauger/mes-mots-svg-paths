window.onload = function() {
    var width = self.frameElement ? 960 : innerWidth,
        height = self.frameElement ? 500 : innerHeight;
    // var dataSet = [
    //     { word: "voisins", pos: [200, 200], col: 0 },
    //     { word: "village", pos: [200, 300], col: 1 },
    //     { word: "bonheur", pos: [200, 400], col: 2 },
    //     { word: "villégiature", pos: [200, 500], col: 3 }
    // ];
    var dataSet = [];
    var drag = d3.behavior.drag()
        .origin(function(d) { return { x: d[0], y: d[1] }; })
        .on("dragstart", dragstarted)
        .on("drag", dragged)
        .on("dragend", dragended);

    var dragWord = d3.behavior.drag()
        .origin(function(d) { return { x: d.pos[0], y: d.pos[1] }; })
        .on("dragstart", dragWordstarted)
        .on("drag", draggedWord)
        .on("dragend", dragWordended);

    var svg = d3.select("#svgcontainer")
        .on("touchstart", nozoom)
        .on("touchmove", nozoom)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("z-index", "1");

    // This is commented out to remove the SVG background.
    // Now, the background is defined in the CSS body element.
    // svg.append("rect")
    //     .attr("width", "100%")
    //     .attr("height", "100%")
    //     .attr("fill", "#D1F7D5");

    var words = svg.selectAll("g")
        .data(dataSet)
        .enter().append("g");

    setWords();

    function setWords() {
        words.attr("x", function(d) { return d.pos[0]; })
            .attr("y", function(d) { return d.pos[1]; })
            .attr("transform", function(d) { return "translate(" + d.pos + ")"; })
            .call(dragWord);

        var rects = words.append("svg:rect")
            // .attr("width", 200)
            .attr("width", function(d) {
                var l = d.word.length;
                var px = 16;
                return (px * 2) + l * 19;
            })
            .attr("height", 45)
            .style("fill", function(d) { return colorList[d.col]; });

        var texts = words.append("svg:text")
            // .attr("x", function(d) { return d.pos[0]; })
            // .attr("y", function(d) { return d.pos[1]; })
            .attr("dx", "0.45em")
            .attr("dy", "1em")
            .text(function(d) { return d.word; })
            .style("fill", function(d) { return colorList[getOppositeColor(d.col)]; })
            .style("font-size", "32px")
            .attr("font-family", "Source Code Pro")
            .style("cursor", "default");
    }

    function updateData(word) {
        if (word.length > 0) {
            var ww = word.length;
            var px = 16;
            ww = (px * 2) + ww * 19;
            var xRand = Math.random() * width;
            var newX = (xRand + ww > innerWidth) ? (xRand - ww) : xRand;
            var newY = Math.max(10, Math.random() * height - 40);
            var col = Math.floor(Math.random() * 5);
            var w = { word: word, pos: [newX, newY], col: col };
            dataSet.push(w);
            words = svg.selectAll("g").data(dataSet);
            // The next two lines fix the endless duplication of
            // text and rectangle objects within groups.
            svg.selectAll("g text").remove();
            svg.selectAll("g rect").remove();
            words.exit().remove();
            words.enter().append("g");
            setWords();
        }
    }

    var form = document.getElementById("newword");

    function handleForm(event) {
        var wo = document.getElementById("word").value;
        updateData(wo);
        document.getElementById("word").value = "";
        event.preventDefault();
    }
    form.addEventListener('submit', handleForm);

    document.getElementById('save-svg').onclick = function() {
        form.target = '_blank';
        writeDownloadLink();
        // form.submit();
    }

    function dragstarted() {
        this.parentNode.appendChild(this);
        d3.select(this).transition()
            .ease("elastic")
            .duration(500)
            .attr("r", 48);
    }

    function dragWordstarted() {
        // this.parentNode.appendChild(this);
    }

    function dragged(d) {
        d[0] = d3.event.x;
        d[1] = d3.event.y;

        d3.select(this)
            .attr("transform", "translate(" + d + ")");
    }

    function draggedWord(d) {
        d.pos[0] = d3.event.x;
        d.pos[1] = d3.event.y;
        d3.select(this)
            .attr("transform", "translate(" + d.pos + ")");
    }

    function dragended() {
        d3.select(this).transition()
            .ease("elastic")
            .duration(500)
            .attr("r", 32);
    }

    function dragWordended() {}

    function nozoom() {
        d3.event.preventDefault();
    }
};

function writeDownloadLink() {
    try {
        var isFileSaverSupported = !!new Blob();
    } catch (e) {
        alert("blob not supported");
    }
    var html = d3.select("svg")
        .attr("title", "test2")
        .attr("version", 1.1)
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .node().parentNode.innerHTML;

    TextToSVG.load('https://cdn.jsdelivr.net/npm/source-code-pro@2.30.2/OTF/SourceCodePro-Medium.otf', function(err, textToSVG) {
        html = html.replace(/(<text dx=)(.*?)(<\/text>)/g, function(a, b, c) {
            let color;
            c.replace(/("fill: )(.*?)(;)/, function(aa, bb, cc) {
                color = cc;
            });
            let text;
            c.replace(/(default;">)(.*)/, function(aa, bb, cc) {
                text = cc;
            });
            var svg = textToSVG.getSVG(text, {
                x: 14,
                y: 32,
                fontSize: 32,
                attributes: {
                    fill: color
                }
            });
            var svgPath;
            svg = svg.replace(/(<path fill=")(.*)(\/>)/g, function(aa) {
                svgPath = aa;
            });
            return svgPath;
        });
        var blob = new Blob([html], { type: "image/svg+xml" });
        saveAs(blob, "mes-mots.svg");
    });
};

var colorList = [
    "#4094C1",
    "#FAD26E",
    "#E96861",
    "#38A56F",
    "#E3DFE8"
];

function getOppositeColor(i) {
    var newIndex;
    switch (i) {
        case 0:
            newIndex = 1;
            break;
        case 1:
            newIndex = 0;
            break;
        case 2:
            newIndex = 4;
            break;
        case 3:
            newIndex = 4;
            break;
        case 4:
            newIndex = 2;
            break;
        default:
            newIndex = 0;
    }
    return newIndex;
}