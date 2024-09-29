// -----JS CODE-----
// SingleclassClassificationController.js
// Version: 0.0.1
// Event: Lens Initialized
// Description: Script that determines emotion
// Allows to call corresponding callbacks

// @input Component.MLComponent mlComponent
// @input string Identity = "Identity"  {"hint": "Output placeholder name of your ML model asset"}
// @input int classIndex = 0 {"hint" : "This is an index of desired class in your neural network output"}
// @ui {"widget":"separator"}

// @input float threshold = 0.5  {"widget" : "slider" , "min" : "0", "max" : "1" ,"step" : "0.01", "hint": "If probability is bigger than this value - class is considered as found, if less - as lost"}
// @ui {"widget":"separator"}

// @ui {"label":"Callbacks"}
// @input Component.ScriptComponent[] scriptsWithCallbacks {"hint": "If these scripts have function script.onFound or script.onLost they will be called correspondingly"}

// @ui {"widget":"separator"}
// @input bool showDebug
// @input Component.ScriptComponent debugScoreBar {"showIf" : "showDebug"}

// @ui {"widget":"separator"}
// @input bool optional
// @input SceneObject loader {"showIf" : "optional"}

// @input SceneObject cameraObject // Reference to the scene object holding the camera
// @input SceneObject toggleObject1 // Object for output 1
// @input SceneObject toggleObject2 // Object for output 2
// @input SceneObject toggleObject3 // Object for output 3
// @input SceneObject toggleObject4 // Object for output 4
// @input SceneObject toggleObject5 // Object for output 5
// @input SceneObject toggleObject6 // Object for output 6
// @input SceneObject toggleObject7 // Object for output 7

var outputData;

if (checkInputs()) {
    print("Inputs checked successfully.");
    script.mlComponent.onLoadingFinished = wrapFunction(script.mlComponent.onLoadingFinished, onLoadingFinished);
}

function onUpdate() {
    if (!outputData) {
        debugPrint("Output data is not set yet.");
        return;
    }

    var p = outputData[script.classIndex]; // Get probability for the desired class

    if (p >= script.threshold) {
        onToggle(script.classIndex + 1); // Class found
    } else {
        onToggle(0); // Class lost
    }

    // Debugging
    if (script.showDebug && script.debugScoreBar && script.debugScoreBar.updateValue) {
        script.debugScoreBar.updateValue(p);
        debugPrint("Probabilities: " + JSON.stringify(outputData));
    }
}

function onLoadingFinished() {
    debugPrint("ML model loading finished...");

    // Check if Identity is set before proceeding
    if (!script.Identity) {
        debugPrint("Identity is not set, skipping ML output retrieval.");
        return;  // Exit early if Identity is null or undefined
    }

    // **Check if cameraObject is set and valid**
    if (!script.cameraObject) {
        debugPrint("Camera scene object is not set.");
        return;
    }

    var cameraComponent = script.cameraObject.getComponent("Camera");
    
    // Check if Camera component exists
    if (!cameraComponent) {
        debugPrint("Camera component not found on the specified scene object.");
        return;
    }

    // Get the camera texture
    var cameraTexture = cameraComponent.outputTexture;

    // Check if the camera texture is valid
    if (!cameraTexture) {
        debugPrint("Camera output texture is not available.");
        return;
    }

    // Resize the texture to match model's expected input size (64x64)
    var resizedTexture = cameraTexture.resize(64, 64);

    // Debugging: Check if resizing worked
    debugPrint("Resized texture dimensions: " + resizedTexture.getWidth() + "x" + resizedTexture.getHeight());

    // Assign the resized texture to the ML model's input (assuming input index 0)
    script.mlComponent.inputs[0].setTexture(resizedTexture);

    // Try to retrieve the output
    var output;
    try {
        output = script.mlComponent.getOutput(script.Identity);
        debugPrint("ML model output acquired: " + JSON.stringify(output)); 
    } catch (e) {
        debugPrint("Error in loading model output: " + e + ". Please check your model's output settings.");
        return;
    }

    // Check if output is a valid array
    if (Array.isArray(output) && output.length > 0) {
        outputData = output;  // Access tensor directly if it's an array
        debugPrint("Output data ready: " + JSON.stringify(outputData));
    } else {
        debugPrint("Error: Output data is not in the expected format.");
        return;
    }

    if (script.classIndex < 0 || script.classIndex >= outputData.length) {
        debugPrint("Error: Class index out of range.");
        return;
    }

    if (script.loader) {
        script.loader.enabled = false;
    }

    script.createEvent("UpdateEvent").bind(onUpdate);
}

function checkInputs() {
    if (!script.mlComponent) {
        debugPrint("Error, ML Component is not set");
        return false;
    }

    if (script.showDebug) {
        if (!script.debugScoreBar) {
            debugPrint("debugScoreBar is not set");
            return false;
        }
    } else if (script.debugScoreBar) {
        script.debugScoreBar.getSceneObject().enabled = false;
    }
    return true;
}

function debugPrint(text) {
    print("SingleclassClassificationHelper: " + text);
}

// Check if Identity is assigned at the beginning of the script
if (script.Identity) {
    debugPrint("Identity value: " + script.Identity + " (Type: " + typeof script.Identity + ")");
} else {
    debugPrint("Identity is not set.");
}

// Helper function to wrap events
function wrapFunction(origFunc, newFunc) {
    if (!origFunc) {
        return newFunc;
    }
    return function() {
        origFunc();
        newFunc();
    };
}
