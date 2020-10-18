const User = require("../../models/user");
const Attachment = require("../../models/attachment");
const bcrypt = require("bcrypt");
const saltRounds = Number(process.env.SALT_ROUNDS);
const jwt = require("jsonwebtoken");
const TOKEN_SECRET = process.env.TOKEN_SECRET;

const updateEmail = async (req, res) => {
  const { currentEmail, newEmail } = req.body;

  if (newEmail === currentEmail) {
    res.status(400).json({
      error: { code: "INVALID_EMAIL", message: "Invalid email" },
    });
  } else {
    try {
      const user = await User.findOne({
        $and: [{ email: currentEmail }, { _id: req.user._id }],
      });
      if (user.email !== currentEmail) {
        res.status(400).json({
          error: { code: "INVALID_EMAIL", message: "Invalid email" },
        });
      } else {
        const existingEmail = (await User.count({ email: newEmail })) > 0;
        if (existingEmail) {
          res.status(400).json({
            error: { code: "EXISTING_EMAIL", message: "Existing email" },
          });
        } else {
          user.email = newEmail;
          user.save((error, updatedUser) => {
            if (error) res.status(400).json({ error });
            else
              res.json({
                success: true,
                updatedUser,
              });
          });
        }
      }
    } catch (error) {
      res.status(400).json({
        error: {
          ...error,
          code: "FAILED_UPDATE_EMAIL",
          message: "Failed to update email",
        },
      });
    }
  }
};

const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (currentPassword === newPassword) {
    res.status(400).json({
      error: { code: "INVALID_PASSWORD", message: "Same password" },
    });
  } else {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        res.status(400).json({
          error: { code: "INVALID_USER", message: "Invalid user" },
        });
      } else {
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          res.status(400).json({
            error: { code: "INVALID_PASSWORD", message: "Invalid password" },
          });
        } else {
          const salt = await bcrypt.genSalt(saltRounds);
          const newPasswordHash = await bcrypt.hash(newPassword, salt);
          user.password = newPasswordHash;
          const savedUser = await user.save();
          const token = jwt.sign({ _id: savedUser._id, password: newPassword }, TOKEN_SECRET);
          res.json({ success: true, token });
        }
      }
    } catch (error) {
      res.status(400).json({
        error: {
          ...error,
          code: "FAILED_UPDATE_PASSWORD",
          message: "Failed to update password",
        },
      });
    }
  }
};

const updateAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.photo) {
      const oldAvatar = await Attachment.findById(user.photo);
      await oldAvatar.remove();
    }
    if (req.files && req.files.length > 0) {
      let attachment = new Attachment(req.files[0]);
      attachment = await attachment.save();
      user.photo = attachment;
    } else {
      user.photo = null;
    }
    const updatedUser = await user.save();
    res.json({ success: true, updatedUser });
  } catch (error) {
    res.status(400).json({
      error: {
        ...error,
        code: "FAILED_UPDATE_AVATAR",
        message: "Failed to update avatar",
      },
    });
  }
};

const updateUser = (req, res) => {
  const { mode } = req.body;
  switch (mode) {
    case "updateEmail":
      updateEmail(req, res);
      break;
    case "updatePassword":
      updatePassword(req, res);
      break;
    case "updateAvatar":
      updateAvatar(req, res);
      break;
    default:
      res.status(400).json({
        error: {
          code: "INVALID_MODE",
          message: "Invalid mode",
        },
      });
      break;
  }
};

module.exports = updateUser;
