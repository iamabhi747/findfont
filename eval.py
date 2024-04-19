import os
import torch
import torch.nn as nn
from torchvision import models, transforms
import matplotlib.pyplot as plt
from PIL import Image

test_dir = './dataset/test'

# Load the test classes and sort them
test_classes = os.listdir(test_dir)
test_classes.sort()

# Load the saved model from disk
model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
num_classes = len(test_classes)
model.fc = nn.Linear(model.fc.in_features, num_classes)
model.load_state_dict(torch.load('font_identifier_model.pth'))

# Define the transformations for the input image
data_transforms = transforms.Compose([
    transforms.Grayscale(num_output_channels=3), # Convert images to grayscale with 3 channels
    transforms.RandomCrop((224, 224)), # Resize images to the expected input size of the model
    transforms.ToTensor(), # Convert images to PyTorch tensors
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]) # Normalize with ImageNet stats
])

image_path = 'test.png'

# Load the image and apply the transformations
image = Image.open(image_path)
image_tensor = data_transforms(image).unsqueeze(0)

# Classify the image using the trained model
model.eval()
with torch.no_grad():
    output = model(image_tensor)
    x, predicted = torch.topk(output,3)
    predicted = predicted[0]
    x = x[0]

for i in range(len(predicted)):
    print(test_classes[predicted[i]], ':', x[i])

# print(f'Predicted class: {test_classes[predicted.item()]}')
# 0 OV
# 1 rg
# 2 z8