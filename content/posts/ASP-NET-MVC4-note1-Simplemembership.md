---
title: ASP.NET MVC4笔记（一） 扩展Simplemembership
date: '2015-02-24T18:45:07+08:00'
tags:
  - asp.net mvc4
  - simplemembership
categories:
  - ASP.NET
---
```C#
using System.Web.Mvc;

namespace MvcClassManageSystem.ActionFilters
{
    public class LogStateFilterAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            base.OnActionExecuting(filterContext);
            //string controller = filterContext.RouteData.Values["controller"].ToString();
            //string action = filterContext.RouteData.Values["action"].ToString();
            //System.Diagnostics.Debug.WriteLine("OnAction:" + controller + "/" + action);

            if (WebMatrix.WebData.WebSecurity.IsAuthenticated == true)
            {
                filterContext.Result = new RedirectToRouteResult(new System.Web.Routing.RouteValueDictionary(new { Controller = "Home", action = "Index" }));
            }
        }
    }
}
```
<!--more-->
```C#
public static class WebUtility
    {
        private static SimpleMembershipProvider membership = (SimpleMembershipProvider)Membership.Provider;
        public static void CreateUserAndAccount(UserProfile userProfile, string Password)
        {
            WebSecurity.CreateUserAndAccount(userProfile.UserName, Password, new
            {
                //TO DO 数据库/模型更改之后别忘记修改此处！！！
                ClassId = userProfile.ClassId,
                UserExtraInfo_Phone = userProfile.UserExtraInfo.Phone,
                UserExtraInfo_Gender = userProfile.UserExtraInfo.Gender,
                UserExtraInfo_BirthDay = userProfile.UserExtraInfo.BirthDay,
                UserExtraInfo_UserDesc = userProfile.UserExtraInfo.UserDesc
            });
        }
        public static void DeleteUserAndAccount(string UserName)
        {
            membership.DeleteAccount(UserName);
            Roles.RemoveUserFromRoles(UserName, Roles.GetRolesForUser(UserName));
            membership.DeleteUser(UserName, true);
        }
        public static void ResetPassword(string UserName, string NewPassword)
        {
            WebSecurity.ResetPassword(WebSecurity.GeneratePasswordResetToken(UserName, 1), NewPassword);
        }
    }
```

```C#
using System.Web.Mvc;
namespace MvcClassManageSystem.Filters
{
    public class MyAuthorizeAttribute : AuthorizeAttribute
    {
        protected override void HandleUnauthorizedRequest(AuthorizationContext filterContext)
        {
            base.HandleUnauthorizedRequest(filterContext);
            if (filterContext.HttpContext.User.Identity.IsAuthenticated)
            {
                filterContext.Result = new RedirectResult("/Account/AccessError");
            }
        }
    }
}
```

```C#
using System.Data.Entity;
using System.Linq;
using System.Web.Security;
using WebMatrix.WebData;
namespace MvcClassManageSystem.Models
{
    public class InitSecurityDb : DropCreateDatabaseAlways<DBManager>
    {
        protected override void Seed(DBManager context)
        {
            WebSecurity.InitializeDatabaseConnection("DefaultConnection", "UserProfile", "UserId", "UserName", autoCreateTables: true);
            var roles = (SimpleRoleProvider)Roles.Provider;
 
            string[] RolesList = new string[] { "Admin", "Teacher", "Student" };
            foreach (var item in RolesList)
            {
                if (!roles.RoleExists(item))
                {
                    roles.CreateRole(item);
                }
            }
            //设置初始班级
            int ClassIndex = 0;
            using (var db = new DBManager())
            {
                var ret = db.ClassProfiles.SingleOrDefault(m => m.ClassName.CompareTo("未知班级") == 0);
                if (ret == null)
                {
                    ret = db.ClassProfiles.Add(new ClassProfile
                    {
                        ClassName = "未知班级",
                        Desc = "班级未知或无意义"
                    });
                    db.SaveChanges();
                }
                ClassIndex = ret.ClassId;
            }
            if (!WebSecurity.UserExists("管理员"))
            {
                WebUtility.CreateUserAndAccount(new UserProfile()
                {
                    UserName = "管理员",
                    ClassId = ClassIndex,
                    UserExtraInfo = new UserExtraInfo()
                    {
                        Phone = "18267912632",
                        Gender = MvcClassManageSystem.Models.Gender.男,
                        BirthDay = new System.DateTime(1993, 9, 28),
                        UserDesc = "本站的管理员！"
                    }
                }, "admin");
                System.Web.Security.Roles.AddUserToRole("管理员", "Admin");
            }
        }
    }
}
```
```C#
 protected void Application_Start()
        {
            Database.SetInitializer<DBManager>(new InitSecurityDb());
            DBManager db = new DBManager();
            db.Database.Initialize(true);
            if (!WebSecurity.Initialized)
            {
                WebSecurity.InitializeDatabaseConnection("DefaultConnection", "UserProfile", "UserId", "UserName", autoCreateTables: true);
            }

            AreaRegistration.RegisterAllAreas();
            WebApiConfig.Register(GlobalConfiguration.Configuration);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
            AuthConfig.RegisterAuth();
        }
```
