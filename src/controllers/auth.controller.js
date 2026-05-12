const { supabase } = require('../config/supabase');
const jwt = require('jsonwebtoken');

exports.register = async (req, res, next) => {
  const { email, password, full_name, role } = req.body;
  console.log(`[AUTH] Signup attempt for email: ${email}`);

  try {
    // 1. Supabase Auth Signup
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.error(`[AUTH] Supabase Signup Error: ${authError.message}`);
      return res.status(authError.status || 400).json({ 
        message: 'Supabase Auth Failure', 
        error: authError.message 
      });
    }

    console.log(`[AUTH] Supabase User Created: ${authData.user.id}`);

    // 2. Profile Creation in Supabase 'profiles' table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: full_name,
        role: role || 'user',
        email: email
      });

    if (profileError) {
      console.error(`[AUTH] Profile Creation Error: ${profileError.message}`);
      // Note: User is created in Auth but profile failed. 
      // We might want to return success but warn, or fail here.
    } else {
      console.log(`[AUTH] Profile Record Created for: ${authData.user.id}`);
    }

    res.status(201).json({
      message: 'Signup successful',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name: full_name,
        role: role || 'user'
      }
    });
  } catch (error) {
    console.error(`[AUTH] Critical Signup Exception: ${error.message}`);
    next(error);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  console.log(`[AUTH] Login attempt for email: ${email}`);

  try {
    // 1. Supabase Auth Login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error(`[AUTH] Supabase Login Error: ${authError.message}`);
      return res.status(authError.status || 401).json({ 
        message: 'Invalid credentials or Auth failure', 
        error: authError.message 
      });
    }

    console.log(`[AUTH] Supabase Session established for: ${authData.user.id}`);

    // 2. Fetch Profile Data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.warn(`[AUTH] Profile Fetch Error: ${profileError.message}`);
    }

    // 3. Generate internal JWT if needed (though Supabase provides its own, 
    // the app seems to expect a specific structure)
    const token = jwt.sign(
      { id: authData.user.id, role: profile?.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log(`[AUTH] Login successful for: ${email}`);

    res.json({
      token,
      supabaseToken: authData.session.access_token,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name: profile?.full_name || 'User',
        role: profile?.role || 'user'
      }
    });
  } catch (error) {
    console.error(`[AUTH] Critical Login Exception: ${error.message}`);
    next(error);
  }
};
